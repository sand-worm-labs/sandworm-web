// // =====================================
// // ⬢ Imports
// // =====================================

// import { Controller, Logger, Param, Post, Body, Res } from '@nestjs/common';
// import { ApiTags } from '@nestjs/swagger';
// import { ApiAuth } from '@sandworm/api';
// import type { FastifyReply } from 'fastify/types/reply';

// import { ChatService } from './chat.service';
// import { CreateChatMessageDto } from './dto/create-chat-message.dto';

// // =====================================
// // ⬢ Controller
// // =====================================

// @ApiTags('Chat')
// @Controller({
//   path: 'chat',
//   version: '1',
// })
// export class ChatController {
//   private readonly logger = new Logger(ChatController.name);

//   constructor(private readonly chatService: ChatService) {}

//   // =====================================
//   // ⬢ Stream Endpoint
//   // =====================================

//   @Post(':workspaceId/:documentId/stream')
//   @ApiAuth({ summary: 'Stream chat response as SSE' })
//   async streamChat(
//     @Param('workspaceId') workspaceId: string,
//     @Param('documentId') documentId: string,
//     @Body() dto: CreateChatMessageDto,
//     @Res() reply: FastifyReply,
//   ) {
//     reply.raw.writeHead(200, {
//       'Content-Type':  'text/event-stream',
//       'Cache-Control': 'no-cache',
//       'Connection':    'keep-alive',
//       'X-Accel-Buffering': 'no', // kills nginx buffering — you will need this
//     });

//     try {
//       await this.chatService.streamToReply(workspaceId, documentId, dto, {
//         onToken: (token) => {
//           reply.raw.write(`data: ${JSON.stringify(token)}\n\n`);
//         },
//         onDone: () => {
//           reply.raw.write(`data: [DONE]\n\n`);
//           reply.raw.end();
//         },
//       });
//     } catch (err) {
//       this.logger.error('Stream failed', err);
//       reply.raw.write(`data: [ERROR]\n\n`);
//       reply.raw.end();
//     }
//   }
// }