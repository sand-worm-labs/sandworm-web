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
    reply.raw.writeHead(200, {
      'Content-Type':      'text/event-stream',
      'Cache-Control':     'no-cache',
      'Connection':        'keep-alive',
      'X-Accel-Buffering': 'no',
    });
  
    try {
      const stream$ = this.chatService.streamResponse(userId, chatId, messageId);
  
      await new Promise<void>((resolve, reject) => {
        stream$.subscribe({
          next: (event: MessageEvent) => {
            reply.raw.write(`data: ${event.data}\n\n`);
          },
          error: (err) => {
            this.logger.error('Stream failed', err);
            reply.raw.write(`data: [ERROR]\n\n`);
            reply.raw.end();
            reject(err);
          },
          complete: () => {
            reply.raw.write(`data: [DONE]\n\n`);
            reply.raw.end();
            resolve();
          },
        });
  
        // ─── Clean up if client disconnects early ──────────
        req.raw.on('close', () => {
          resolve();
        });
      });
    } catch (err) {
      this.logger.error('Stream failed', err);
      if (!reply.raw.writableEnded) {
        reply.raw.write(`data: [ERROR]\n\n`);
        reply.raw.end();
      }
    }
  }
}