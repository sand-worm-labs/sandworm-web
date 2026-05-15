import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';
import { ChatService } from '../chat.service';
import { Chat } from '../model/chat.model';
import { Message } from '../model/message.model';
import { Vote } from '../model/vote.model';
import {
  CreateChatInput,
  SendMessageInput,
  UpdateChatInput,
  VoteMessageInput,
} from '../dto/chat.dto';

@Resolver(() => Chat)
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}


  @Query(() => [Chat], { name: 'chats', description: 'List chats for workspace/document' })
  async getChats(
    @CurrentUser('id') userId: string,
    @Args('workspaceId') workspaceId: string,
    @Args('documentId') documentId: string,
  ): Promise<Chat[]> {
    return this.chatService.getChats(userId, workspaceId, documentId);
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

  @Mutation(() => Chat, { name: 'pinChat', description: 'Pin or unpin a chat' })
  async pinChat(
    @CurrentUser('id') userId: string,
    @Args('chatId') chatId: string,
  ): Promise<Chat> {
    return this.chatService.pinChat(chatId, userId);
  }

  @Mutation(() => Message, { name: 'sendMessage', description: 'Send a user message' })
  async sendMessage(
    @CurrentUser('id') userId: string,
    @Args('input') input: SendMessageInput,
  ): Promise<Message> {
    return this.chatService.sendMessage(userId, input);
  }

  @Mutation(() => Vote, { name: 'voteMessage', description: 'Upvote or downvote a message' })
  async voteMessage(
    @CurrentUser('id') userId: string,
    @Args('input') input: VoteMessageInput,
  ): Promise<Vote> {
    return this.chatService.voteMessage(userId, input);
  }

  @Mutation(() => Boolean, { name: 'removeVote', description: 'Retract a vote on a message' })
  async removeVote(
    @CurrentUser('id') userId: string,
    @Args('messageId') messageId: string,
  ): Promise<boolean> {
    return this.chatService.removeVote(userId, messageId);
  }
}