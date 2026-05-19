import {
  Injectable,
  Logger,
  NotFoundException,
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


const LOREM_IPSUM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

const SIMULATED_TOKEN_DELAY_MS = 60;


@Injectable()
export class ChatService {
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
  ) {
    this.aiBaseUrl = this.configService.getOrThrow('ai.url', { infer: true });
    this.handshakeToken = this.configService.getOrThrow('ai.handshakeToken', { infer: true });
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

    if(input.updateDocumentTitle) {
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

    return Message.fromEntity(message);
  }

    streamResponse(
      userId: string,
      chatId: string,
      messageId: string,
    ): Observable<MessageEvent> {
      return new Observable<MessageEvent>((subscriber) => {
        this.executeSimulatedStream(userId, chatId, messageId, subscriber);
      });
    }

  private async executeSimulatedStream(
    userId: string,
    chatId: string,
    messageId: string,
    subscriber: Subscriber<MessageEvent>,
  ): Promise<void> {
    const chat = await this.chatRepository.findOne({ where: { id: chatId, userId } });
    if (!chat) {
      subscriber.error(new NotFoundException('Chat not found'));
      return;
    }

    const userMessage = await this.messageRepository.findOne({
      where: { id: messageId, chat: { id: chatId }, role: MessageRole.USER },
    });
    if (!userMessage) {
      subscriber.error(new NotFoundException('Message not found'));
      return;
    }

    if (userMessage.isAnswered) {
      subscriber.complete();
      return;
    }

    const tokens = LOREM_IPSUM.split(' ');
    let fullContent = '';

    try {
      for (const word of tokens) {
        await new Promise((r) => setTimeout(r, SIMULATED_TOKEN_DELAY_MS));
        const token = word + ' ';
        fullContent += token;
        subscriber.next({ data: token } as MessageEvent);
      }
    } catch (err) {
      subscriber.error(err);
      return;
    }

    await Promise.all([
      this.messageRepository.save(
        this.messageRepository.create({
          chat:    { id: chatId },
          role:    MessageRole.ASSISTANT,
          content: fullContent.trim(),
        }),
      ),
      this.messageRepository.update(messageId, { isAnswered: true }),
    ]);

    subscriber.complete();
  }
}