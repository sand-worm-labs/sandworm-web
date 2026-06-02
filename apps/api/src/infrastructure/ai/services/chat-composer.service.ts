import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Observable, Subject, firstValueFrom } from 'rxjs';
import type { IncomingMessage } from 'http';
import { AllConfigType } from '@/config/config.type';
import {
  MessageContentPart,
  MessageAttachment,
  MessageContentType,
  MessageRole,
  FinishReason,
  MessageUsage,
  TextPart,
  ImageUrlPart,
  DocumentPart,
} from '@/features/chat/types/message.types';
import { WorkspaceService } from '@/features/workspace/service/workspace.service';

export interface ChatAiContext {
  user_id: string;
  workspace_id: string;
  document_id: string;
  focused_block_ids?: string[];
  chat_id: string;
}

export interface GenerateTitleRequest {
  message: string;
  openrouter_api_key: string;
  context: Omit<ChatAiContext, 'chat_id'>;
}

export interface GenerateTitleResponse {
  title: string;
}

export interface CompletionMessage {
  role: MessageRole;
  content: string | MessageContentPart[];
  attachments?: MessageAttachment[];
}

export interface StreamCompletionRequest {
  messages: CompletionMessage[];
  context: ChatAiContext;
  derived_context?: string;
  temperature?: number;
  max_tokens?: number;
}

export type SsePartEvent =
  | { type: 'thinking';       thinking: string; duration_ms: number }
  | { type: 'tool_call';      toolName: string; category: string; params: Record<string, string> }
  | { type: 'tool_result';    summary: string; rowCount?: number }
  | { type: 'block_action';   action: 'created' | 'edited' | 'ran' | 'deleted'; blockId: string; blockType: string; blockTitle: string }
  | { type: 'pending_review'; blocks: { blockId: string; blockType: string; blockTitle: string; action: 'created' | 'edited' }[] }
  | { type: 'error';          message: string; retryable: boolean };

export interface SseTokenEvent {
  token: string;
}

export interface CompletionDoneEvent {
  content: string;
  finish_reason: FinishReason;
  usage?: MessageUsage;
}

export type CompletionStreamEvent =
  | { event: 'part';  data: SsePartEvent }
  | { event: 'token'; data: SseTokenEvent }
  | { event: 'done';  data: CompletionDoneEvent };

@Injectable()
export class ChatComposerService {
  private readonly logger = new Logger(ChatComposerService.name);

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly httpService: HttpService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  private get aiConfig() {
    return this.configService.getOrThrow('ai', { infer: true });
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
      'x-handshake-token': this.aiConfig.handshakeToken,
    };
  }

  streamCompletion(request: StreamCompletionRequest): Observable<CompletionStreamEvent> {
    const subject = new Subject<CompletionStreamEvent>();

    this.executeStream(request, subject).catch(async (err) => {
      let detail = err?.message;
      if (err?.response?.data?.on) {
        const chunks: Buffer[] = [];
        await new Promise<void>((res) => {
          err.response.data.on('data', (c: Buffer) => chunks.push(c));
          err.response.data.on('end', res);
          err.response.data.on('error', res);
        });
        detail = Buffer.concat(chunks).toString();
      }
      this.logger.error(`streamCompletion failed — status=${err?.response?.status} body=${detail}`);
      subject.error(err);
    });

    return subject.asObservable();
  }

  private async executeStream(
    request: StreamCompletionRequest,
    subject: Subject<CompletionStreamEvent>,
  ): Promise<void> {
    const { url } = this.aiConfig;

    const workspace = await this.workspaceService.getWorkspaceById(request.context.workspace_id);
    const openrouter_api_key = await this.workspaceService.getWorkspaceAiKey(workspace.id);

    const payload = {
      messages: request.messages.map((m) => ({
        role: m.role,
        content: m.attachments?.length
          ? this.buildContentParts(m.content, m.attachments)
          : m.content,
      })),
      model: workspace.assistantModel,
      openrouter_api_key,
      context: request.context,
      derived_context: request.derived_context ?? '',
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens ?? 0,
      stream: true,
    };

    this.logger.log(`POST ${url}/chat/completions model=${payload.model} msgs=${payload.messages.length}`);

    const response = await firstValueFrom(
      this.httpService.post<IncomingMessage>(`${url}/chat/completions`, payload, {
        headers: { ...this.headers, Accept: 'text/event-stream' },
        responseType: 'stream',
      }),
    );

    const stream = response.data;
    let buffer = '';
    let accumulated = '';

    stream.on('data', (chunk: Buffer) => {
      buffer += chunk.toString('utf8');
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === ':' || trimmed.startsWith('event:')) continue;

        if (trimmed.startsWith('data:')) {
          const raw = trimmed.slice(5).trim();

          if (raw === '[DONE]') {
            subject.next({ event: 'done', data: { content: accumulated.trim(), finish_reason: FinishReason.STOP } });
            subject.complete();
            return;
          }

          try {
            const parsed: { event: string; data: unknown } = JSON.parse(raw);

            if (parsed.event === 'token') {
              const token = (parsed.data as SseTokenEvent).token;
              accumulated += token;
              subject.next({ event: 'token', data: { token } });
            } else if (parsed.event === 'part') {
              subject.next({ event: 'part', data: parsed.data as SsePartEvent });
            } else if (parsed.event === 'done') {
              subject.next({ event: 'done', data: parsed.data as CompletionDoneEvent });
              subject.complete();
              return;
            }
          } catch {
            this.logger.warn(`Could not parse SSE line: ${raw}`);
          }
        }
      }
    });

    stream.on('end', () => {
      if (!subject.closed) {
        subject.next({ event: 'done', data: { content: accumulated.trim(), finish_reason: FinishReason.STOP } });
        subject.complete();
      }
    });

    stream.on('error', (err: Error) => {
      this.logger.error('AI stream error', err);
      subject.error(err);
    });
  }

  buildContentParts(
    content: string | MessageContentPart[],
    attachments?: MessageAttachment[],
  ): MessageContentPart[] {
    const parts: MessageContentPart[] = [];

    if (typeof content === 'string') {
      if (content.trim()) {
        parts.push({ type: MessageContentType.TEXT, text: content } satisfies TextPart);
      }
    } else {
      parts.push(...content);
    }

    if (attachments?.length) {
      parts.push(...this.serializeAttachments(attachments));
    }

    return parts;
  }

  serializeAttachments(attachments: MessageAttachment[]): MessageContentPart[] {
    return attachments.flatMap((att): MessageContentPart[] => {
      if (att.type === 'image') {
        return [{ type: MessageContentType.IMAGE_URL, image_url: { url: att.url, detail: 'auto' } } satisfies ImageUrlPart];
      }

      if (att.type === 'file' && att.mimeType === 'application/pdf') {
        return [{ type: MessageContentType.DOCUMENT, source: { type: 'url', media_type: 'application/pdf', url: att.url } } satisfies DocumentPart];
      }

      const label = att.name ?? att.url;
      return [{ type: MessageContentType.TEXT, text: `[Attached file: ${label}${att.mimeType ? ` (${att.mimeType})` : ''}]` } satisfies TextPart];
    });
  }
}
