import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AllConfigType } from '@/config/config.type';
import { WorkspaceService } from '@/features/workspace/service/workspace.service';
import { GeneratorContext, BaseEditRequest, BaseFixRequest } from '../types/generator.types';

export type SqlGeneratorContext = GeneratorContext;

export interface SqlGeneratorResponse {
  code: string;
}

@Injectable()
export class SqlGeneratorService {
  private readonly logger = new Logger(SqlGeneratorService.name);

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly httpService: HttpService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async edit(context: SqlGeneratorContext, prompt: string): Promise<SqlGeneratorResponse> {
    const { url, handshakeToken } = this.configService.getOrThrow('ai', { infer: true });

    const workspace = await this.workspaceService.getWorkspaceById(context.workspace_id);
    this.logger.log(`Editing SQL for document: ${context.document_id}`);

    const { data } = await firstValueFrom(
      this.httpService.post<SqlGeneratorResponse>(
        `${url}/sql/edit`,
        {
          openrouter_api_key: `OPENROUTER_KEY_PLACEHOLDER`,
          prompt,
          model: workspace.assistantModel,
          context,
        } satisfies BaseEditRequest,
        { headers: { 'Content-Type': 'application/json', 'x-handshake-token': handshakeToken } },
      ),
    );
    return data;
  }

  async fix(context: SqlGeneratorContext, error_message: string): Promise<SqlGeneratorResponse> {
    const { url, handshakeToken } = this.configService.getOrThrow('ai', { infer: true });

    const workspace = await this.workspaceService.getWorkspaceById(context.workspace_id);
    this.logger.log(`Fixing SQL for document: ${context.document_id}`);

    const { data } = await firstValueFrom(
      this.httpService.post<SqlGeneratorResponse>(
        `${url}/sql/fix`,
        {
          openrouter_api_key: `OPENROUTER_KEY_PLACEHOLDER`,
          error_message,
          model: workspace.assistantModel,
          context,
        } satisfies BaseFixRequest,
        { headers: { 'Content-Type': 'application/json', 'x-handshake-token': handshakeToken } },
      ),
    );
    return data;
  }
}
