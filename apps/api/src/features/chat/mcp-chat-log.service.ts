import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ChatEntity,
  DocumentEntity,
  MessageEntity,
  MessageRole,
  UserWorkspaceEntity,
} from '@sandworm/postgresql-typeorm';
import { Between, EntityManager, Like, MoreThan, Raw, Repository } from 'typeorm';
import { McpDisplayDto, McpPromptDto, McpToolCallDto, RecordMcpToolCallsDto } from './dto/mcp-tool-calls.dto';

const MCP_CHAT_TITLE = 'MCP session';
// Same length AI chats cut their first message to (ChatService).
const TITLE_PROMPT_CHARS = 50;
const MCP_JOB_PREFIX = 'mcp-';
// Calls closer together than this are one agent session, kept in one message.
const SESSION_GAP_MS = 30 * 60 * 1000;

// "stablecoin supply by chain (Claude Code MCP)": what the user asked, like an
// AI chat, with the agent it came through as that agent names itself.
export function mcpChatTitle(prompt?: string | null, client?: string | null): string {
  const asked = prompt?.replace(/\s+/g, ' ').trim();
  if (!asked) return MCP_CHAT_TITLE;
  const short = asked.length > TITLE_PROMPT_CHARS ? `${asked.slice(0, TITLE_PROMPT_CHARS).trimEnd()}…` : asked;
  return `${short} (${client ? `${client} MCP` : 'MCP'})`;
}

type StreamEvent = Record<string, unknown>;

// The same events the AI sidecar emits (apps/ai/src/util/stream_events.py).
// The sidecar numbers content blocks per message; a session is appended to call
// by call, so these all carry 0. Nothing that replays stored events reads it.
const blockStart = (content_block: StreamEvent): StreamEvent => ({ type: 'content_block_start', index: 0, content_block });
const blockDelta = (delta: StreamEvent): StreamEvent => ({ type: 'content_block_delta', index: 0, delta });
const BLOCK_STOP: StreamEvent = { type: 'content_block_stop', index: 0 };

function displayEvents(display: McpDisplayDto, durationMs: number): StreamEvent[] {
  switch (display.kind) {
    case 'thinking':
      return [
        blockStart({ type: 'thinking', thinking: '' }),
        blockDelta({ type: 'thinking_delta', thinking: display.text ?? '', duration_ms: durationMs }),
        BLOCK_STOP,
      ];
    case 'block':
      return [
        blockDelta({
          type: 'block_action_delta',
          action: display.action,
          block_id: display.blockId ?? '',
          block_type: display.blockType ?? '',
          block_title: display.blockTitle ?? '',
          executed_at: display.executedAt ?? null,
        }),
        BLOCK_STOP,
      ];
    default:
      return [blockDelta({ type: 'text_delta', text: `${display.text ?? ''}\n\n` })];
  }
}

// `mcp_tool_call` holds the full call for debugging; the web chat ignores
// event types it does not know. The events after it are what the chat shows.
export function toolCallEvents(call: McpToolCallDto): StreamEvent[] {
  return [
    {
      type: 'mcp_tool_call',
      tool: call.toolName,
      arguments: call.arguments,
      result: call.result ?? null,
      is_error: call.isError,
      duration_ms: call.durationMs,
      request_id: call.requestId ?? null,
      at: call.at,
    },
    ...(call.display ?? []).flatMap(display => displayEvents(display, call.durationMs)),
  ];
}

// Same join ChatService.buildAssistantContent does for AI messages.
const eventsText = (events: StreamEvent[]) =>
  events
    .map(event => event.delta as { type?: string; text?: string } | undefined)
    .filter(delta => delta?.type === 'text_delta')
    .map(delta => delta!.text ?? '')
    .join('');

const runKey = (blockId?: string | null, executedAt?: string | null) => `${blockId}@${executedAt}`;
const isRun = (display: McpDisplayDto) => display.kind === 'block' && display.action === 'ran' && !!display.executedAt;

// Saves what an agent did through apps/mcp as a chat on the notebook, in the
// shape AI turns are saved in: the prompt as a user message, then one
// assistant message whose `parts` are stream events.
@Injectable()
export class McpChatLogService {
  constructor(
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  async record(userId: string, dto: RecordMcpToolCallsDto): Promise<{ chatId: string }> {
    const { documentId, prompt } = dto;
    const workspaceId = await this.workspaceOf(userId, documentId);

    return this.chatRepository.manager.transaction(async em => {
      // Agents call tools in parallel: without this, two first calls would each create the chat.
      await em.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`mcp-chat:${userId}:${documentId}`]);

      const chat = await this.findOrCreateChat(em, userId, workspaceId, dto);
      let message = await em.findOne(MessageEntity, {
        where: {
          chat: { id: chat.id },
          jobId: Like(`${MCP_JOB_PREFIX}%`),
          updatedAt: MoreThan(new Date(Date.now() - SESSION_GAP_MS)),
        },
        order: { createdAt: 'DESC' },
        select: { id: true, createdAt: true },
      });

      if (prompt && (await this.savePrompt(em, chat.id, prompt, message))) message = null;

      const calls = await this.withoutRepeatedRuns(em, message, dto.calls);
      await this.saveEvents(em, chat.id, message, calls.flatMap(toolCallEvents));

      return { chatId: chat.id };
    });
  }

  private async workspaceOf(userId: string, documentId: string): Promise<string> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      select: { id: true, workspaceId: true },
    });
    const isMember =
      document && (await this.userWorkspaceRepository.existsBy({ userId, workspaceId: document.workspaceId }));
    if (!document || !isMember) throw new NotFoundException('Document not found');
    return document.workspaceId;
  }

  private async findOrCreateChat(
    em: EntityManager,
    userId: string,
    workspaceId: string,
    { documentId, prompt, client }: RecordMcpToolCallsDto,
  ): Promise<ChatEntity> {
    const title = mcpChatTitle(prompt?.text, client?.name);
    const chat = await em.findOne(ChatEntity, {
      where: { userId, documentId, lastContext: Raw(alias => `${alias} ->> 'source' = 'mcp'`) },
      order: { createdAt: 'DESC' },
    });

    if (!chat) {
      return em.save(
        em.create(ChatEntity, {
          userId,
          workspace: { id: workspaceId },
          document: { id: documentId },
          title,
          private: false,
          lastContext: { source: 'mcp', client: client?.name ?? null, clientVersion: client?.version ?? null },
        }),
      );
    }

    // A chat opened by calls that carried no prompt is named once one arrives.
    if (prompt && chat.title === MCP_CHAT_TITLE) {
      chat.title = title;
      await em.update(ChatEntity, chat.id, { title });
    }
    return chat;
  }

  // Saves what the user asked as their message, the way an AI turn starts with
  // one. Agents repeat the prompt on several calls, so one already saved is
  // left alone. Returns true when the prompt opens a new turn, whose calls
  // then go in a fresh assistant message.
  private async savePrompt(
    em: EntityManager,
    chatId: string,
    prompt: McpPromptDto,
    message: MessageEntity | null,
  ): Promise<boolean> {
    const last = await em.findOne(MessageEntity, {
      where: { chat: { id: chatId }, role: MessageRole.USER },
      order: { createdAt: 'DESC' },
      select: { id: true, content: true, createdAt: true },
    });
    if (last?.content === prompt.text) return false;

    const save = (createdAt: Date) =>
      em.save(em.create(MessageEntity, { chat: { id: chatId }, role: MessageRole.USER, content: prompt.text, createdAt }));

    if (!prompt.afterWork || !message) {
      await save(new Date());
      return true;
    }

    // The prompt came with the closing reply. It goes before the work, unless
    // this turn already opened with one (worded differently by the agent).
    const turnHasPrompt =
      last &&
      last.createdAt < message.createdAt &&
      !(await em.existsBy(MessageEntity, {
        chat: { id: chatId },
        role: MessageRole.ASSISTANT,
        createdAt: Between(new Date(last.createdAt.getTime() + 1), new Date(message.createdAt.getTime() - 1)),
      }));
    if (!turnHasPrompt) await save(new Date(message.createdAt.getTime() - 1));
    return false;
  }

  // An agent polling get_run_results reports the same run again: show it once.
  private async withoutRepeatedRuns(
    em: EntityManager,
    message: MessageEntity | null,
    calls: McpToolCallDto[],
  ): Promise<McpToolCallDto[]> {
    if (!calls.some(call => call.display?.some(isRun))) return calls;

    const saved: { block_id: string; executed_at: string }[] = message
      ? await em.query(
          `SELECT part->'delta'->>'block_id' AS block_id, part->'delta'->>'executed_at' AS executed_at
           FROM messages, jsonb_array_elements(parts) AS part
           WHERE id = $1 AND part->'delta'->>'action' = 'ran'`,
          [message.id],
        )
      : [];
    const shown = new Set(saved.map(row => runKey(row.block_id, row.executed_at)));

    const isNew = (display: McpDisplayDto) => {
      if (!isRun(display)) return true;
      const key = runKey(display.blockId, display.executedAt);
      if (shown.has(key)) return false;
      shown.add(key);
      return true;
    };
    return calls.map(call => ({ ...call, display: call.display?.filter(isNew) }));
  }

  private async saveEvents(
    em: EntityManager,
    chatId: string,
    message: MessageEntity | null,
    events: StreamEvent[],
  ): Promise<void> {
    const text = eventsText(events);

    if (message) {
      await em
        .createQueryBuilder()
        .update(MessageEntity)
        .set({
          parts: () => `COALESCE(parts, '[]'::jsonb) || CAST(:events AS jsonb)`,
          content: () => `COALESCE(content, '') || :text`,
        })
        .where('id = :id')
        .setParameters({ id: message.id, events: JSON.stringify(events), text })
        .execute();
      return;
    }

    const jobId = `${MCP_JOB_PREFIX}${randomUUID()}`;
    await em.save(
      em.create(MessageEntity, {
        chat: { id: chatId },
        role: MessageRole.ASSISTANT,
        // A prompt saved in this same transaction would otherwise share its timestamp.
        createdAt: new Date(Date.now() + 1),
        jobId,
        content: text,
        parts: [
          { type: 'message_start', message: { id: jobId, chat_id: chatId } },
          ...events,
        ] as unknown as MessageEntity['parts'],
      }),
    );
  }
}
