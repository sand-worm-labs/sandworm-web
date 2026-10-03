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
import { McpDisplayDto, McpToolCallDto, RecordMcpToolCallsDto } from './dto/mcp-tool-calls.dto';

const MCP_CHAT_TITLE = 'MCP session';
const MCP_JOB_PREFIX = 'mcp-';
// Calls closer together than this are one agent session, kept in one message.
const SESSION_GAP_MS = 30 * 60 * 1000;

// The sidecar numbers content blocks per message; a session is appended to
// call by call, so these all carry 0. Nothing that replays stored events reads
// the index (see deriveMessageDisplay in useChatStream.tsx).
const INDEX = 0;

type StreamEvent = Record<string, unknown>;

// One display hint as the events the AI sidecar emits for the same thing
// (apps/ai/src/util/stream_events.py), so the chat panel renders an MCP
// session the way it renders an AI turn.
function displayEvents(display: McpDisplayDto, durationMs: number): StreamEvent[] {
  switch (display.kind) {
    case 'thinking':
      return [
        { type: 'content_block_start', index: INDEX, content_block: { type: 'thinking', thinking: '' } },
        {
          type: 'content_block_delta',
          index: INDEX,
          delta: { type: 'thinking_delta', thinking: display.text ?? '', duration_ms: durationMs },
        },
        { type: 'content_block_stop', index: INDEX },
      ];
    case 'block':
      return [
        {
          type: 'content_block_delta',
          index: INDEX,
          delta: {
            type: 'block_action_delta',
            action: display.action,
            block_id: display.blockId ?? '',
            block_type: display.blockType ?? '',
            block_title: display.blockTitle ?? '',
            executed_at: display.executedAt ?? null,
          },
        },
        { type: 'content_block_stop', index: INDEX },
      ];
    case 'text':
      return [
        { type: 'content_block_delta', index: INDEX, delta: { type: 'text_delta', text: `${display.text ?? ''}\n\n` } },
      ];
    default:
      // A prompt is the user's message, not part of the assistant's.
      return [];
  }
}

// What one tool call adds to a message's `parts`: `mcp_tool_call` holds the
// full call for debugging (the web chat ignores event types it does not
// know), followed by the events that show it.
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
    .map(e => e.delta as { type?: string; text?: string } | undefined)
    .filter(delta => delta?.type === 'text_delta')
    .map(delta => delta!.text ?? '')
    .join('');

const runKey = (blockId?: string | null, executedAt?: string | null) => `${blockId}@${executedAt}`;
const isRun = (display: McpDisplayDto) => display.kind === 'block' && display.action === 'ran' && !!display.executedAt;

// Saves what an agent did through apps/mcp as a chat on the notebook, in the
// shape AI turns are saved in: one assistant message whose `parts` are stream
// events. The MCP server only sees tool calls, so the agent's own prompt,
// thinking and reply are not part of it.
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
    const { documentId } = dto;
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      select: { id: true, workspaceId: true },
    });
    const isMember =
      document && (await this.userWorkspaceRepository.existsBy({ userId, workspaceId: document.workspaceId }));
    if (!document || !isMember) throw new NotFoundException('Document not found');

    return this.chatRepository.manager.transaction(async em => {
      // Agents call tools in parallel: without this, two first calls would
      // each create the chat.
      await em.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`mcp-chat:${userId}:${documentId}`]);

      const chat =
        (await em.findOne(ChatEntity, {
          where: { userId, documentId, lastContext: Raw(alias => `${alias} ->> 'source' = 'mcp'`) },
          order: { createdAt: 'DESC' },
        })) ??
        (await em.save(
          em.create(ChatEntity, {
            userId,
            workspace: { id: document.workspaceId },
            document: { id: documentId },
            title: MCP_CHAT_TITLE,
            private: false,
            lastContext: { source: 'mcp', client: dto.userAgent ?? null },
          }),
        ));

      let current = await em.findOne(MessageEntity, {
        where: {
          chat: { id: chat.id },
          jobId: Like(`${MCP_JOB_PREFIX}%`),
          updatedAt: MoreThan(new Date(Date.now() - SESSION_GAP_MS)),
        },
        order: { createdAt: 'DESC' },
        select: { id: true, createdAt: true },
      });

      const prompt = dto.calls.flatMap(call => call.display ?? []).find(display => display.kind === 'prompt' && display.text);
      const turn = prompt ? await this.savePrompt(em, chat.id, prompt, current) : 'same';
      if (turn === 'new') current = null;

      // An agent polling get_run_results reports the same run again: show it once.
      const shown = new Set<string>();
      if (current && dto.calls.some(call => call.display?.some(isRun))) {
        const rows: { block_id: string; executed_at: string }[] = await em.query(
          `SELECT part->'delta'->>'block_id' AS block_id, part->'delta'->>'executed_at' AS executed_at
           FROM messages, jsonb_array_elements(parts) AS part
           WHERE id = $1 AND part->'delta'->>'action' = 'ran'`,
          [current.id],
        );
        rows.forEach(row => shown.add(runKey(row.block_id, row.executed_at)));
      }
      const calls = dto.calls.map(call => ({
        ...call,
        display: call.display?.filter(display => {
          if (!isRun(display)) return true;
          const key = runKey(display.blockId, display.executedAt);
          return !shown.has(key) && !!shown.add(key);
        }),
      }));

      const events = calls.flatMap(toolCallEvents);
      const text = eventsText(events);

      if (current) {
        await em
          .createQueryBuilder()
          .update(MessageEntity)
          .set({
            parts: () => `COALESCE(parts, '[]'::jsonb) || CAST(:events AS jsonb)`,
            content: () => `COALESCE(content, '') || :text`,
          })
          .where('id = :id')
          .setParameters({ id: current.id, events: JSON.stringify(events), text })
          .execute();
      } else {
        const jobId = `${MCP_JOB_PREFIX}${randomUUID()}`;
        await em.save(
          em.create(MessageEntity, {
            chat: { id: chat.id },
            role: MessageRole.ASSISTANT,
            // After a prompt saved in this same transaction, which would
            // otherwise share its timestamp.
            createdAt: new Date(Date.now() + 1),
            jobId,
            content: text,
            parts: [
              { type: 'message_start', message: { id: jobId, chat_id: chat.id } },
              ...events,
            ] as unknown as MessageEntity['parts'],
          }),
        );
      }

      return { chatId: chat.id };
    });
  }

  // Saves what the user asked as their message, the way an AI turn starts
  // with one. Agents repeat the prompt on several calls, so one already saved
  // for this turn is left alone. Returns 'new' when the prompt opens a turn,
  // so the calls after it go in a fresh assistant message.
  private async savePrompt(
    em: EntityManager,
    chatId: string,
    prompt: McpDisplayDto,
    current: MessageEntity | null,
  ): Promise<'new' | 'same'> {
    const last = await em.findOne(MessageEntity, {
      where: { chat: { id: chatId }, role: MessageRole.USER },
      order: { createdAt: 'DESC' },
      select: { id: true, content: true, createdAt: true },
    });
    if (last?.content === prompt.text) return 'same';

    const save = (createdAt: Date) =>
      em.save(em.create(MessageEntity, { chat: { id: chatId }, role: MessageRole.USER, content: prompt.text, createdAt }));

    if (!prompt.afterWork || !current) {
      await save(new Date());
      return 'new';
    }

    // The prompt came with the closing reply. It goes before the work, unless
    // this turn already opened with one (worded differently by the agent).
    const opened =
      last &&
      last.createdAt < current.createdAt &&
      !(await em.existsBy(MessageEntity, {
        chat: { id: chatId },
        role: MessageRole.ASSISTANT,
        createdAt: Between(new Date(last.createdAt.getTime() + 1), new Date(current.createdAt.getTime() - 1)),
      }));
    if (!opened) await save(new Date(current.createdAt.getTime() - 1));
    return 'same';
  }
}
