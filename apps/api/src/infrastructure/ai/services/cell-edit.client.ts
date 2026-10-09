import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AllConfigType } from '@/config/config.type';
import { AuthService } from '@/features/auth/core/auth.service';
import { WorkspaceService } from '@/features/workspace/service/workspace.service';
import { GeneratorContext } from '../types/generator.types';

export type CellEditKind = 'code' | 'sql' | 'markdown';

// The AI service has the MCP server change the cell itself, so this only says
// that it happened: no text comes back to be written by anyone else.
export interface CellEditResult {
  cell_id: string;
  updated: boolean;
}

// Asks the AI service to edit or fix one cell. It acts as the user, so their
// access token goes with the request.
@Injectable()
export class CellEditClient {
  private readonly logger = new Logger(CellEditClient.name);

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly httpService: HttpService,
    private readonly workspaceService: WorkspaceService,
    private readonly authService: AuthService,
  ) {}

  // Aborting `signal` closes the request, which is what tells the AI service to stop.
  edit(kind: CellEditKind, context: GeneratorContext, blockId: string, prompt: string, signal?: AbortSignal): Promise<CellEditResult> {
    return this.send(kind, 'edit', context, blockId, { prompt }, signal);
  }

  fix(kind: Exclude<CellEditKind, 'markdown'>, context: GeneratorContext, blockId: string, errorMessage: string, signal?: AbortSignal): Promise<CellEditResult> {
    return this.send(kind, 'fix', context, blockId, { error_message: errorMessage }, signal);
  }

  private async send(
    kind: CellEditKind,
    action: 'edit' | 'fix',
    context: GeneratorContext,
    blockId: string,
    request: { prompt: string } | { error_message: string },
    signal?: AbortSignal,
  ): Promise<CellEditResult> {
    const { url, handshakeToken } = this.configService.getOrThrow('ai', { infer: true });

    const workspace = await this.workspaceService.getWorkspaceById(context.workspace_id);
    const openrouter_api_key = await this.workspaceService.getWorkspaceAiKey(workspace.id);
    const { accessToken } = await this.authService.issueTokenPair(context.user_id);
    this.logger.log(`${action} ${kind} cell ${blockId} in document ${context.document_id}`);

    const { data } = await firstValueFrom(
      this.httpService.post<CellEditResult>(
        `${url}/${kind}/${action}`,
        {
          ...request,
          block_id: blockId,
          openrouter_api_key,
          model: workspace.assistantModel,
          context: { ...context, user_token: accessToken },
        },
        { headers: { 'Content-Type': 'application/json', 'x-handshake-token': handshakeToken }, signal },
      ),
    );
    return data;
  }
}
