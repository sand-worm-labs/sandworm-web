import {  Args,Query,Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';
import { ChatService } from '../chat.service';
import { Message } from '../model/message.model';

@Resolver(() => Message)
export class MessageResolver {
  constructor(private readonly chatService: ChatService) {}
  
  @Query(() => Boolean, { name: 'messageVote', nullable: true })
  async getMessageVote(
    @CurrentUser('id') userId: string,
    @Args('messageId') messageId: string,
  ): Promise<boolean | null> {
    return this.chatService.getMessageVote(userId, messageId);
  }
}