import { Controller, Logger, Param, Post, Body, Res, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiAuth, CurrentUser } from '@sandworm/api';
import type { FastifyReply } from 'fastify/types/reply';
import type { FastifyRequest } from 'fastify/types/request';
import { ChatService } from './chat.service';
import { McpChatLogService } from './mcp-chat-log.service';
import { RecordMcpToolCallsDto } from './dto/mcp-tool-calls.dto';
import { NoAudit } from '@/features/audit/audit.decorators';

@ApiTags('Chat')
@Controller({ path: 'chat', version: '1' })
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly mcpChatLog: McpChatLogService,
  ) {}

  // Written by apps/mcp after tool calls, as the user who made them. One per
  // call, so it stays out of the audit log.
  @NoAudit()
  @Post('mcp/tool-calls')
  @ApiAuth({ summary: 'Save MCP tool calls to the notebook\'s MCP chat' })
  async recordMcpToolCalls(@CurrentUser('id') userId: string, @Body() dto: RecordMcpToolCallsDto) {
    return this.mcpChatLog.record(userId, dto);
  }

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