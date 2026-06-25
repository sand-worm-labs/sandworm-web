import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Observable, Subscriber } from 'rxjs';
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
import type { FastifyReply } from 'fastify/types/reply';
import type { FastifyRequest } from 'fastify/types/request';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AiJobEvent,AiJobEventNames } from '@/core/events/ai-job.events';
import { MessageCreatedEvent, MessageEventNames } from '@/core/events/message.events';

export interface SseEvent {
  event?: 'part' | 'token';
  data: string;
}

type BlockAction='created'|'edited'|'ran'|'deleted';
type Block={blockId:string;blockType:string;blockTitle:string};

export type PartPayload=
  |{type:'pending_review';blocks:(Block&{action:Extract<BlockAction,'created'|'edited'>})[]}
  |{type:'thinking';thinking:string;duration_ms:number}
  |{type:'tool_call';toolName:string;category:string;params:Record<string,string>}
  |({type:'block_action';action:BlockAction}&Block)
  |{type:'tool_result';summary:string;rowCount?:number}
  |{type:'error';message:string;retryable:boolean};

const SIMULATED_TOKEN_DELAY_MS = 100;
const SIMULATED_PART_DELAY_MS = 1000;

const LOREM_IPSUM = `Done. I've built the full DAO treasury analysis across 8 DAOs with $1.08B nominal value. Uniswap and Aave are 100% own-token. Compound is 99.8% liquid. The chart and written summary are in the blocks above. Want me to add Arbitrum and ENS once their data clears?`;

@Injectable()
export class ChatService implements OnModuleInit {
  private readonly logger = new Logger(ChatService.name);
  private readonly aiBaseUrl: string;
  private readonly handshakeToken: string;

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
    private readonly eventEmitter: EventEmitter2
  ) {
    this.aiBaseUrl = this.configService.getOrThrow('ai.url', { infer: true });
    this.handshakeToken = this.configService.getOrThrow('ai.handshakeToken', { infer: true });
  }

  onModuleInit(): void {
    this.eventEmitter.on(AiJobEventNames.AI_JOB_EVENT, (event: AiJobEvent) => {
      this.logger.log(`[ai-job] chatId=${event.chatId} jobId=${event.jobId} type=${event.type}`);
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
    if (!document) throw new NotFoundException('Document not found or does not belong to workspace');

    const chat = this.chatRepository.create({
      userId,
      workspace: { id: workspaceId },
      document: { id: documentId },
      title,
      private: false,
      lastContext: null,
    });

    const savedChat = await this.chatRepository.save(chat);

    await this.messageRepository.save(
      this.messageRepository.create({
        chat: { id: savedChat.id },
        role: MessageRole.USER,
        content: message,
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

  async voteMessage(userId: string, input: VoteMessageInput): Promise<Vote> {
    const message = await this.messageRepository.findOne({
      where: { id: input.messageId },
    });
    if (!message) throw new NotFoundException('Message not found');

    const existing = await this.voteRepository.findOne({
      where: { userId, messageId: input.messageId },
    });

    if (existing) {
      existing.isUpvoted = input.isUpvoted;
      return Vote.fromEntity(await this.voteRepository.save(existing));
    }

    return Vote.fromEntity(
      await this.voteRepository.save(
        this.voteRepository.create({
          userId,
          messageId: input.messageId,
          isUpvoted: input.isUpvoted,
        }),
      ),
    );
  }

  async removeVote(userId: string, messageId: string): Promise<boolean> {
    const vote = await this.voteRepository.findOne({ where: { userId, messageId } });
    if (!vote) throw new NotFoundException('Vote not found');

    await this.voteRepository.remove(vote);
    return true;
  }

  async sendMessage(userId: string, input: SendMessageInput): Promise<Message> {
    const { chatId, content, model, focusedBlocks } = input;

    const chat = await this.chatRepository.findOne({ where: { id: chatId, userId } });
    if (!chat) throw new NotFoundException('Chat not found');

    const message = await this.messageRepository.save(
      this.messageRepository.create({
        chat: { id: chatId },
        role: MessageRole.USER,
        content,
        model,
        focusedBlocks: focusedBlocks ?? null,
      }),
    );

    this.eventEmitter.emit(MessageEventNames.MESSAGE_CREATED, { chatId } satisfies MessageCreatedEvent);

    return Message.fromEntity(message);
  }

  async createOrAppendMessageByJobId(
    chatId: string,
    jobId: string,
    data: any,
  ): Promise<void> {
    const existing = await this.messageRepository.findOne({
      where: { jobId, chat: { id: chatId } },
    });
    const incoming = Array.isArray(data) ? data : [data];
    if (existing) {
      const currentParts = Array.isArray(existing.parts) ? existing.parts : [];
      await this.messageRepository.update(existing.id, {
        parts: [...currentParts, ...incoming],
      });
    } else {
      await this.messageRepository.save({
        chat: { id: chatId },
        role: MessageRole.ASSISTANT,
        jobId,
        parts: incoming,
      });
    }
  }

  streamResponse(userId: string, chatId: string, messageId: string): Observable<SseEvent> {
    return new Observable<SseEvent>((subscriber) => {
      this.executeStreamResponse(userId, chatId, messageId, subscriber);
    });
  }

  private async executeStreamResponse(
    userId: string,
    chatId: string,
    messageId: string,
    subscriber: Subscriber<SseEvent>,
  ): Promise<void> {
    const chat = await this.chatRepository.findOne({ where: { id: chatId, userId } });
    if (!chat) { subscriber.error(new NotFoundException('Chat not found')); return; }

    const userMessage = await this.messageRepository.findOne({
      where: { id: messageId, chat: { id: chatId }, role: MessageRole.USER },
    });
    if (!userMessage) { subscriber.error(new NotFoundException('Message not found')); return; }

    if (userMessage.isAnswered) { subscriber.complete(); return; }

    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
    const emitPart = (payload: PartPayload) => subscriber.next({ event: 'part', data: JSON.stringify(payload) });
    const emitToken = (token: string) => subscriber.next({ event: 'token', data: token });

    try {
      await delay(SIMULATED_PART_DELAY_MS);
      emitPart({ type: 'thinking', thinking: 'The user wants a DAO treasury analysis. I need to fetch balances using the DAO Treasury PowerToolbox, then flatten with SQL, cluster with Python, visualise, and write a markdown summary.', duration_ms: 5800 });

      await delay(SIMULATED_PART_DELAY_MS);
      emitPart({ type: 'tool_call', toolName: 'DAO Treasury Balances', category: 'defi', params: { daos: 'top-8', chain: 'Ethereum' } });

      await delay(SIMULATED_PART_DELAY_MS);
      emitPart({ type: 'block_action', action: 'created', blockType: 'PowerToolbox', blockTitle: 'DAO treasury balances', blockId: 'ptb-001' });
      await delay(SIMULATED_PART_DELAY_MS);
      emitPart({ type: 'block_action', action: 'ran', blockType: 'PowerToolbox', blockTitle: 'DAO treasury balances', blockId: 'ptb-001' });

      await delay(SIMULATED_PART_DELAY_MS);
      emitPart({ type: 'tool_result', summary: 'Fetched 8 DAOs · $1.08B nominal value', rowCount: 8 });

      await delay(SIMULATED_PART_DELAY_MS);
      emitPart({ type: 'block_action', action: 'created', blockType: 'SQL', blockTitle: 'Flatten token holdings', blockId: 'sql-001' });
      await delay(SIMULATED_PART_DELAY_MS);
      emitPart({ type: 'block_action', action: 'ran', blockType: 'SQL', blockTitle: 'Flatten token holdings', blockId: 'sql-001' });

      await delay(SIMULATED_PART_DELAY_MS);
      emitPart({ type: 'block_action', action: 'created', blockType: 'Python', blockTitle: 'Cluster by asset type', blockId: 'py-001' });
      await delay(SIMULATED_PART_DELAY_MS);
      emitPart({ type: 'block_action', action: 'ran', blockType: 'Python', blockTitle: 'Cluster by asset type', blockId: 'py-001' });

      await delay(SIMULATED_PART_DELAY_MS);
      emitPart({ type: 'block_action', action: 'created', blockType: 'Visualization', blockTitle: 'Treasury breakdown chart', blockId: 'viz-001' });
      await delay(SIMULATED_PART_DELAY_MS);
      emitPart({ type: 'block_action', action: 'ran', blockType: 'Visualization', blockTitle: 'Treasury breakdown chart', blockId: 'viz-001' });

      await delay(SIMULATED_PART_DELAY_MS);
      emitPart({ type: 'block_action', action: 'created', blockType: 'Markdown', blockTitle: 'Analysis summary', blockId: 'md-001' });
      await delay(SIMULATED_PART_DELAY_MS);
      emitPart({ type: 'block_action', action: 'edited', blockType: 'Markdown', blockTitle: 'Analysis summary', blockId: 'md-001' });

      emitPart({
        type: 'pending_review',
        blocks: [
          { blockId: 'sql-001', blockType: 'SQL',    blockTitle: 'Flatten token holdings', action: 'created' },
          { blockId: 'py-001',  blockType: 'Python', blockTitle: 'Cluster by asset type',  action: 'created' },
          { blockId: 'md-001',  blockType: 'Markdown', blockTitle: 'Analysis summary',     action: 'edited'  },
        ],
      });
      let fullContent = '';
      for (const word of LOREM_IPSUM.split(' ')) {
        await delay(SIMULATED_TOKEN_DELAY_MS);
        const token = word + ' ';
        fullContent += token;
        emitToken(token);
      }

      await Promise.all([
        this.messageRepository.save(
          this.messageRepository.create({
            chat: { id: chatId },
            role: MessageRole.ASSISTANT,
            content: fullContent.trim(),
          }),
        ),
        this.messageRepository.update(messageId, { isAnswered: true }),
      ]);

      subscriber.complete();
    } catch (err) {
      subscriber.error(err);
    }
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
  
    const stream$ = this.streamResponse(userId, chatId, messageId);
  
    await new Promise<void>((resolve, reject) => {
      stream$.subscribe({
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
}