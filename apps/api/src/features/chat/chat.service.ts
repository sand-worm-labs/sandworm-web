import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ChatEntity, MessageEntity } from '@sandworm/postgresql-typeorm';
import { firstValueFrom } from 'rxjs';
import { Chat } from './model/chat.model';
import { Message } from './model/message.model';
import { CreateChatInput, EditMessageInput, SendMessageInput, UpdateChatInput } from './dto/chat.dto';
import { MessageRole } from './types/message.types';
import { AllConfigType } from '@/core/config/config.type';


@Injectable()
export class ChatService {
  private readonly aiBaseUrl: string;
  private readonly apiToken: string;

  constructor(
    @InjectRepository(ChatEntity) private chatRepository: Repository<ChatEntity>,
    @InjectRepository(MessageEntity) private messageRepository: Repository<MessageEntity>, 
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {
    this.aiBaseUrl = this.configService.getOrThrow('ai.url', {infer: true,}) 
    this.apiToken = this.configService.getOrThrow('ai.handshakeToken', {infer: true,});
  }


  async getChats(userId: string, workspaceId: string, documentId: string): Promise<Chat[]> {
    const entities = await this.chatRepository.find({
      where: { userId, workspaceId, documentId },
      relations: ['messages'],
    });
    return entities.map((e) => Chat.fromEntity(e));
  }

  async getChat(chatId: string, userId: string): Promise<Chat> {
    const entity = await this.chatRepository.findOne({
      where: { id: chatId, userId },
      relations: ['messages'],
    });
    if (!entity) throw new Error('Chat not found');
    return Chat.fromEntity(entity, true);
  }

  async getMessages(chatId: string, userId: string): Promise<Message[]> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId, userId },
    });
    if (!chat) throw new Error('Chat not found');

    const messages = await this.messageRepository.find({
      where: { chat: { id: chatId } },
      order: { createdAt: 'ASC' },
    });
    return Message.fromEntities(messages);
  }

  async createChat(userId: string, input: CreateChatInput): Promise<Chat> {
    const title = input.title || input.message.substring(0, 50);

    const chat = this.chatRepository.create({
      userId,
      workspaceId: input.workspaceId,
      documentId: input.documentId,
      title,
      private: false,
      lastContext: null,
    });

    const saved = await this.chatRepository.save(chat);

    await this.messageRepository.save(
      this.messageRepository.create({
        chat: { id: saved.id },
        role: MessageRole.USER,
        content: input.message,
      }),
    );

    return Chat.fromEntity(saved);
  }

  async updateChat(userId: string, input: UpdateChatInput): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: { id: input.chatId, userId },
    });
    if (!chat) throw new Error('Chat not found');

    if (input.title) chat.title = input.title;

    return Chat.fromEntity(await this.chatRepository.save(chat));
  }

  async deleteChat(chatId: string, userId: string): Promise<boolean> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId, userId },
    });
    if (!chat) throw new Error('Chat not found');

    await this.messageRepository.delete({ chat: { id: chatId } });
    await this.chatRepository.delete({ id: chatId });

    return true;
  }

  async addUserMessage(userId: string, chatId: string, input: SendMessageInput): Promise<Message> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId, userId },
    });
    if (!chat) throw new Error('Chat not found');

    await this.messageRepository.save(
      this.messageRepository.create({
        chat: { id: chatId },
        role: MessageRole.USER,
        content: input.content,
        focusedBlockId: input.blockId ?? null,
      }),
    );

    const aiResponse = input.blockId
      ? await this.callEditText(input.content)
      : await this.callChat(input.content);

    const aiMessage = await this.messageRepository.save(
      this.messageRepository.create({
        chat: { id: chatId },
        role: MessageRole.ASSISTANT,
        content: aiResponse,
      }),
    );

    await this.chatRepository.save({
      ...chat,
      lastContext: {
        lastMessage: input.content,
        lastResponse: aiResponse,
        updatedAt: new Date(),
      },
    });

    return Message.fromEntity(aiMessage);
  }

  async editMessage(userId: string, input: EditMessageInput): Promise<Message> {
    const chat = await this.chatRepository.findOne({
      where: { id: input.chatId, userId },
    });
    if (!chat) throw new Error('Chat not found');

    const message = await this.messageRepository.findOne({
      where: { id: input.messageId, chat: { id: input.chatId } },
    });
    if (!message) throw new Error('Message not found');
    if (message.role !== MessageRole.USER) throw new Error('Only user messages can be edited');

    message.content = input.content;
    return Message.fromEntity(await this.messageRepository.save(message));
  }

  private async callChat(content: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiBaseUrl}/chat`, { content }),
      );
      return response.data.content;
    } catch (error) {
      throw new Error('Failed to get AI response');
    }
  }

  private async callEditText(content: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiBaseUrl}/edit-text`, {
          currentText: content,
          userPrompt: 'Edit this text',
        }),
      );
      return response.data.rewrittenText;
    } catch (error) {
      throw new Error('Failed to rewrite text');
    }
  }
}