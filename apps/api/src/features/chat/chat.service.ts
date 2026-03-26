import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatEntity, MessageEntity } from '@sandworm/postgresql-typeorm';
import { Chat } from './model/chat.model';
import { Message } from './model/message.model';
import { CreateChatInput, SendMessageInput, UpdateChatInput } from './dto/chat.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {}

  async createChat(userId: string, input: CreateChatInput): Promise<Chat> {
    const entity = this.chatRepository.create({
      userId,
      title: input.title,
      private: false,
    });
    const saved = await this.chatRepository.save(entity);
    return Chat.fromEntity(saved);
  }

  async getChats(userId: string): Promise<Chat[]> {
    const entities = await this.chatRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
    return Chat.fromEntities(entities);
  }

  async getChat(chatId: string, userId: string): Promise<Chat> {
    const entity = await this.chatRepository.findOne({
      where: { id: chatId, userId },
      relations: ['messages'],
      order: { messages: { createdAt: 'ASC' } } as any,
    });
    if (!entity) throw new NotFoundException(`Chat ${chatId} not found`);
    return Chat.fromEntity(entity, true);
  }

  async updateChat(userId: string, input: UpdateChatInput): Promise<Chat> {
    const entity = await this.chatRepository.findOne({
      where: { id: input.chatId, userId },
    });
    if (!entity) throw new NotFoundException(`Chat ${input.chatId} not found`);

    if (input.title !== undefined) entity.title = input.title;
    if (input.private !== undefined) entity.private = input.private;

    const saved = await this.chatRepository.save(entity);
    return Chat.fromEntity(saved);
  }

  async deleteChat(chatId: string, userId: string): Promise<boolean> {
    const result = await this.chatRepository.delete({ id: chatId, userId });
    return (result.affected ?? 0) > 0;
  }

  async addUserMessage(userId: string, input: SendMessageInput): Promise<Message> {
    await this.assertChatOwner(input.chatId, userId);

    const entity = this.messageRepository.create({
      chat: { id: input.chatId },
      role: 'user',
      content: input.content,
      parts: [],
      attachments: [],
    });
    const saved = await this.messageRepository.save(entity);

    // Touch chat updatedAt
    await this.chatRepository.update({ id: input.chatId }, { updatedAt: new Date() });

    return Message.fromEntity({ ...saved, chat: { id: input.chatId } } as any);
  }

  async addAssistantMessage(chatId: string, content: string): Promise<Message> {
    const entity = this.messageRepository.create({
      chat: { id: chatId },
      role: 'assistant',
      content,
      parts: [],
      attachments: [],
    });
    const saved = await this.messageRepository.save(entity);
    await this.chatRepository.update({ id: chatId }, { updatedAt: new Date() });
    return Message.fromEntity({ ...saved, chat: { id: chatId } } as any);
  }

  async getMessages(chatId: string, userId: string): Promise<Message[]> {
    await this.assertChatOwner(chatId, userId);

    const entities = await this.messageRepository.find({
      where: { chat: { id: chatId } },
      order: { createdAt: 'ASC' },
    });
    return Message.fromEntities(entities);
  }

  private async assertChatOwner(chatId: string, userId: string): Promise<void> {
    const exists = await this.chatRepository.existsBy({ id: chatId, userId });
    if (!exists) throw new NotFoundException(`Chat ${chatId} not found`);
  }
}
