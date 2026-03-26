import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';
import { ChatService } from './chat.service';
import { Chat } from './model/chat.model';
import { Message } from './model/message.model';
import { CreateChatInput, SendMessageInput, UpdateChatInput } from './dto/chat.dto';

@Resolver(() => Chat)
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  @Query(() => [Chat], { name: 'chats', description: 'List all chats for the current user' })
  async getChats(@CurrentUser('id') userId: string): Promise<Chat[]> {
    return this.chatService.getChats(userId);
  }

  @Query(() => Chat, { name: 'chat', description: 'Get a chat with its messages' })
  async getChat(
    @CurrentUser('id') userId: string,
    @Args('chatId') chatId: string,
  ): Promise<Chat> {
    return this.chatService.getChat(chatId, userId);
  }

  @Query(() => [Message], { name: 'chatMessages', description: 'Get messages for a chat' })
  async getChatMessages(
    @CurrentUser('id') userId: string,
    @Args('chatId') chatId: string,
  ): Promise<Message[]> {
    return this.chatService.getMessages(chatId, userId);
  }

  @Mutation(() => Chat, { name: 'createChat', description: 'Create a new chat' })
  async createChat(
    @CurrentUser('id') userId: string,
    @Args('input') input: CreateChatInput,
  ): Promise<Chat> {
    return this.chatService.createChat(userId, input);
  }

  @Mutation(() => Chat, { name: 'updateChat', description: 'Update chat title or visibility' })
  async updateChat(
    @CurrentUser('id') userId: string,
    @Args('input') input: UpdateChatInput,
  ): Promise<Chat> {
    return this.chatService.updateChat(userId, input);
  }

  @Mutation(() => Boolean, { name: 'deleteChat', description: 'Delete a chat and its messages' })
  async deleteChat(
    @CurrentUser('id') userId: string,
    @Args('chatId') chatId: string,
  ): Promise<boolean> {
    return this.chatService.deleteChat(chatId, userId);
  }

  @Mutation(() => Message, { name: 'sendMessage', description: 'Add a user message to a chat' })
  async sendMessage(
    @CurrentUser('id') userId: string,
    @Args('input') input: SendMessageInput,
  ): Promise<Message> {
    return this.chatService.addUserMessage(userId, input);
  }
}
