import { Controller, Logger, Param, Post, Body, Res, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiAuth, CurrentUser } from '@sandworm/api';
import type { FastifyReply } from 'fastify/types/reply';
import type { FastifyRequest } from 'fastify/types/request';
import { ChatService } from './chat.service';

@ApiTags('Chat')
@Controller({ path: 'chat', version: '1' })
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Post(':chatId/:messageId/stream')
  @ApiAuth({ summary: 'Stream chat response as SSE' })
  async streamChat(
    @Param('chatId') chatId: string,
    @Param('messageId') messageId: string,
    @CurrentUser('id') userId: string,
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ) {
    await this.chatService.streamToReply(userId, chatId, messageId, req, reply);
  }

  @Post(':chatId/abort')
  @ApiAuth({ summary: 'Abort the in-flight AI turn for a chat' })
  async abortChat(
    @Param('chatId') chatId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.chatService.abort(chatId, userId);
    return { aborted: true };
  }
}