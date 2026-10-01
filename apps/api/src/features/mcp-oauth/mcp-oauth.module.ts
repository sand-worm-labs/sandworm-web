import { Module } from '@nestjs/common';
import { AuthModule } from '@/features/auth/core/auth.module';
import { WorkspaceModule } from '@/features/workspace/workspace.module';
import { McpOauthController } from './mcp-oauth.controller';
import { McpOauthMetadataController } from './mcp-oauth-metadata.controller';
import { McpOauthService } from './mcp-oauth.service';

@Module({
  imports: [AuthModule, WorkspaceModule],
  controllers: [McpOauthController, McpOauthMetadataController],
  providers: [McpOauthService],
})
export class McpOauthModule {}
