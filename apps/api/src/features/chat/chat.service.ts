import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Observable, ReplaySubject } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import {
  ChatEntity,
  DocumentEntity,
  MessageEntity,
  VoteEntity,
  WorkspaceEntity,
} from '@sandworm/postgresql-typeorm';
import { Chat } from './model/chat.model';
import { Message } from './model/message.model';
import { Vote } from './model/vote.model';
import {
  CreateChatInput,
  SendMessageInput,
  UpdateChatInput,
  VoteMessageInput,
} from './dto/chat.dto';
import { MessageRole } from './types/message.types';
import { AllConfigType } from '@/core/config/config.type';
import { TitleAiExecutorService } from '../ai-execution/service/title-ai-executor.service';
import { WorkspaceService } from '../workspace/service/workspace.service';
import type { FastifyReply } from 'fastify/types/reply';
import type { FastifyRequest } from 'fastify/types/request';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AiJobEvent, AiJobEventNames } from '@/core/events/ai-job.events';
import { MessageCreatedEvent, MessageEventNames } from '@/core/events/message.events';
import { AiStreamEvent } from './types/stream.types';

export interface SseEvent {
  event?: AiStreamEvent['type'];
  data: string;
}



@Injectable()
export class ChatService implements OnModuleInit {
  private readonly logger        = new Logger(ChatService.name);
  private readonly aiBaseUrl:      string;
  private readonly handshakeToken: string;
  private readonly chatStream:      boolean;
  private readonly chatTemperature: number;
  private readonly chatMaxTokens:   number;

  private readonly chatStreams = new Map<string, ReplaySubject<SseEvent>>();

  constructor(
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    @InjectRepository(VoteEntity)
    private readonly voteRepository: Repository<VoteEntity>,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly titleAiExecutorService: TitleAiExecutorService,
    private readonly eventEmitter: EventEmitter2,
    private readonly httpService: HttpService,
    private readonly workspaceService: WorkspaceService,
  ) {
    this.aiBaseUrl        = this.configService.getOrThrow('ai.url',             { infer: true });
    this.handshakeToken   = this.configService.getOrThrow('ai.handshakeToken',  { infer: true });
    this.chatStream       = this.configService.getOrThrow('ai.chatStream',      { infer: true });
    this.chatTemperature  = this.configService.getOrThrow('ai.chatTemperature', { infer: true });
    this.chatMaxTokens    = this.configService.getOrThrow('ai.chatMaxTokens',   { infer: true });
  }

  onModuleInit(): void {
    this.eventEmitter.on(AiJobEventNames.AI_JOB_EVENT,     (e: AiJobEvent)          => this.handleAiJobEvent(e));
    this.eventEmitter.on(MessageEventNames.MESSAGE_CREATED, (e: MessageCreatedEvent) => this.handleChatMessageCreated(e));
  }



  private async handleChatMessageCreated(event: MessageCreatedEvent): Promise<void> {
    const [chat, messages] = await Promise.all([
      this.chatRepository.findOne({ where: { id: event.chatId } }),
      this.messageRepository.find({
        where: { chat: { id: event.chatId } },
        order: { createdAt: 'DESC' },
      }),
    ]);

    if (!chat) return;

    const lastUserMessage  = messages.find(m => m.role === MessageRole.USER);
    const focusedBlockIds  = lastUserMessage?.focusedBlocks?.map(b => b.id) ?? [];
    const openrouterApiKey = await this.workspaceService.getWorkspaceAiKey(chat.workspaceId);

    if (!openrouterApiKey) {
      this.logger.warn(`[message-created] no OpenRouter key for workspace=${chat.workspaceId}`);
      return;
    }

    const subject = new ReplaySubject<SseEvent>(Infinity, 5 * 60 * 1000);
    this.chatStreams.set(chat.id, subject);

    const payload = {
      messages:           messages.map(m => ({ role: m.role, content: m.content ?? '' })),
      model:              lastUserMessage?.model ?? '',
      openrouter_api_key: openrouterApiKey,
      context: {
        user_id:           chat.userId,
        workspace_id:      chat.workspaceId,
        document_id:       chat.documentId,
        focused_block_ids: focusedBlockIds,
        chat_id:           chat.id,
      },
      stream:          this.chatStream,
      temperature:     this.chatTemperature,
      max_tokens:      this.chatMaxTokens,
    };

    this.httpService
      .post(`${this.aiBaseUrl}/chat/completions`, payload, {
        headers: {
          'Content-Type':      'application/json',
          'x-handshake-token': this.handshakeToken,
        },
      })
      .subscribe({
        next:  (r)   => this.logger.log(`[chat-completions] job started status=${r.status}`),
        error: (err) => this.logger.error('[chat-completions] failed to start job', err),
      });

  }

  // The AI sidecar (apps/ai/src/util/stream_events.py) constructs the full
  // Claude-Messages-API-style envelope — this just relays it onto the SSE
  // subject and handles the two terminal event types.
  private handleAiJobEvent(event: AiJobEvent): void {
    this.logger.log(`[ai-job] chatId=${event.chatId} type=${event.type}`);

    const subject = this.chatStreams.get(event.chatId);
    if (!subject) return;

    if (event.type === 'intent_classified' || event.type === 'intent_parsed') return;

    const payload = { type: event.type, ...event.payload } as AiStreamEvent;
    subject.next({ event: payload.type, data: JSON.stringify(payload) });

    if (payload.type === 'message_stop') {
      subject.complete();
      this.chatStreams.delete(event.chatId);
    } else if (payload.type === 'error') {
      subject.error(new Error(payload.error.message));
      this.chatStreams.delete(event.chatId);
    }
  }

  streamResponse(userId: string, chatId: string, messageId: string): Observable<SseEvent> {
    return new Observable<SseEvent>((subscriber) => {
      Promise.all([
        this.chatRepository.findOne({ where: { id: chatId, userId } }),
        this.messageRepository.findOne({ where: { id: messageId, chat: { id: chatId }, role: MessageRole.USER } }),
      ]).then(([chat, userMessage]) => {
        if (!chat)        { subscriber.error(new NotFoundException('Chat not found'));    return; }
        if (!userMessage) { subscriber.error(new NotFoundException('Message not found')); return; }
        if (userMessage.isAnswered) { subscriber.complete(); return; }

        if (!this.chatStreams.has(chatId)) {
          this.chatStreams.set(chatId, new ReplaySubject<SseEvent>(Infinity, 5 * 60 * 1000));
        }

        this.chatStreams.get(chatId)!.subscribe(subscriber);
      }).catch((err) => subscriber.error(err));
    });
  }

  async streamToReply(
    userId: string,
    chatId: string,
    messageId: string,
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    reply.raw.writeHead(200, {
      'Content-Type':      'text/event-stream',
      'Cache-Control':     'no-cache',
      'Connection':        'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const write = (event: SseEvent) => {
      if (reply.raw.writableEnded) return;
      const line = event.event
        ? `event: ${event.event}\ndata: ${event.data}\n\n`
        : `data: ${event.data}\n\n`;
      reply.raw.write(line);
    };

    await new Promise<void>((resolve, reject) => {
      this.streamResponse(userId, chatId, messageId).subscribe({
        next: write,
        error: (err) => {
          this.logger.error('Stream failed', err);
          if (!reply.raw.writableEnded) {
            reply.raw.write('data: [ERROR]\n\n');
            reply.raw.end();
          }
          reject(err);
        },
        complete: () => {
          if (!reply.raw.writableEnded) {
            reply.raw.write('data: [DONE]\n\n');
            reply.raw.end();
          }
          resolve();
        },
      });

      req.raw.on('close', () => resolve());
    });
  }


  async chatExists(chatId: string): Promise<boolean> {
    return this.chatRepository.existsBy({ id: chatId });
  }

  async getChats(userId: string, workspaceId: string, documentId: string): Promise<Chat[]> {
    const entities = await this.chatRepository.find({
      where: { userId, workspaceId, documentId },
      order: { createdAt: 'DESC' },
    });
    return Chat.fromEntities(entities);
  }

  async getChat(chatId: string, userId: string): Promise<Chat> {
    const entity = await this.chatRepository.findOne({
      where: { id: chatId, userId },
      relations: ['messages'],
    });
    if (!entity) throw new NotFoundException('Chat not found');
    return Chat.fromEntity(entity, true);
  }

  async getMessages(chatId: string, userId: string): Promise<Message[]> {
    const chat = await this.chatRepository.findOne({ where: { id: chatId, userId } });
    if (!chat) throw new NotFoundException('Chat not found');

    const messages = await this.messageRepository.find({
      where: { chat: { id: chatId } },
      order: { createdAt: 'ASC' },
    });
    return Message.fromEntities(messages);
  }

  async getMessageVote(userId: string, messageId: string): Promise<boolean | null> {
    const vote = await this.voteRepository.findOne({ where: { userId, messageId } });
    return vote?.isUpvoted ?? null;
  }

  async createChat(userId: string, input: CreateChatInput): Promise<Chat> {
    let { workspaceId, documentId, message, title, model, focusedBlocks } = input;
    title = title ?? message.substring(0, 50);

    const [workspace, document] = await Promise.all([
      this.workspaceRepository.findOne({ where: { id: workspaceId } }),
      this.documentRepository.findOne({ where: { id: documentId, workspaceId } }),
    ]);

    if (!workspace) throw new NotFoundException('Workspace not found');
    if (!document)  throw new NotFoundException('Document not found or does not belong to workspace');

    const savedChat = await this.chatRepository.save(
      this.chatRepository.create({
        userId,
        workspace:   { id: workspaceId },
        document:    { id: documentId },
        title,
        private:     false,
        lastContext: null,
      }),
    );

    await this.messageRepository.save(
      this.messageRepository.create({
        chat:          { id: savedChat.id },
        role:          MessageRole.USER,
        content:       message,
        model,
        focusedBlocks: focusedBlocks ?? null,
      }),
    );

    this.eventEmitter.emit(MessageEventNames.MESSAGE_CREATED, { chatId: savedChat.id } satisfies MessageCreatedEvent);

    if (input.updateDocumentTitle) {
      this.titleAiExecutorService.updateTitle(documentId, workspaceId, title);
    }

    return Chat.fromEntity(savedChat);
  }

  async updateChat(userId: string, input: UpdateChatInput): Promise<Chat> {
    const chat = await this.chatRepository.findOne({ where: { id: input.chatId, userId } });
    if (!chat) throw new NotFoundException('Chat not found');

    if (input.title) chat.title = input.title;
    return Chat.fromEntity(await this.chatRepository.save(chat));
  }

  async deleteChat(chatId: string, userId: string): Promise<boolean> {
    const chat = await this.chatRepository.findOne({ where: { id: chatId, userId } });
    if (!chat) throw new NotFoundException('Chat not found');

    await this.chatRepository.remove(chat);
    return true;
  }

  async pinChat(chatId: string, userId: string): Promise<Chat> {
    const chat = await this.chatRepository.findOne({ where: { id: chatId, userId } });
    if (!chat) throw new NotFoundException('Chat not found');

    chat.pin = !chat.pin;
    return Chat.fromEntity(await this.chatRepository.save(chat));
  }

  async sendMessage(userId: string, input: SendMessageInput): Promise<Message> {
    const { chatId, content, model, focusedBlocks } = input;

    const chat = await this.chatRepository.findOne({ where: { id: chatId, userId } });
    if (!chat) throw new NotFoundException('Chat not found');

    const message = await this.messageRepository.save(
      this.messageRepository.create({
        chat:          { id: chatId },
        role:          MessageRole.USER,
        content,
        model,
        focusedBlocks: focusedBlocks ?? null,
      }),
    );

    this.eventEmitter.emit(MessageEventNames.MESSAGE_CREATED, { chatId } satisfies MessageCreatedEvent);

    return Message.fromEntity(message);
  }


  async voteMessage(userId: string, input: VoteMessageInput): Promise<Vote> {
    const message = await this.messageRepository.findOne({ where: { id: input.messageId } });
    if (!message) throw new NotFoundException('Message not found');

    const existing = await this.voteRepository.findOne({ where: { userId, messageId: input.messageId } });

    if (existing) {
      existing.isUpvoted = input.isUpvoted;
      return Vote.fromEntity(await this.voteRepository.save(existing));
    }

    return Vote.fromEntity(
      await this.voteRepository.save(
        this.voteRepository.create({ userId, messageId: input.messageId, isUpvoted: input.isUpvoted }),
      ),
    );
  }

  async removeVote(userId: string, messageId: string): Promise<boolean> {
    const vote = await this.voteRepository.findOne({ where: { userId, messageId } });
    if (!vote) throw new NotFoundException('Vote not found');

    await this.voteRepository.remove(vote);
    return true;
  }


  async createOrAppendMessageByJobId(chatId: string, jobId: string, data: any): Promise<void> {
    const existing = await this.messageRepository.findOne({
      where: { jobId, chat: { id: chatId } },
    });
    const incoming = Array.isArray(data) ? data : [data];

    if (existing) {
      const currentParts = Array.isArray(existing.parts) ? existing.parts : [];
      await this.messageRepository.update(existing.id, { parts: [...currentParts, ...incoming] });
    } else {
      await this.messageRepository.save({
        chat: { id: chatId },
        role: MessageRole.ASSISTANT,
        jobId,
        parts: incoming,
      });
    }
  }
}