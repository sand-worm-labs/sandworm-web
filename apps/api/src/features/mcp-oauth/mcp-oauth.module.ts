import { Module } from '@nestjs/common';
import { AuthModule } from '@/features/auth/core/auth.module';
import { McpOauthController } from './mcp-oauth.controller';
import { McpOauthMetadataController } from './mcp-oauth-metadata.controller';
import { McpOauthService } from './mcp-oauth.service';

@Module({
  imports: [AuthModule],
  controllers: [McpOauthController, McpOauthMetadataController],
  providers: [McpOauthService],
})
export class McpOauthModule {}
