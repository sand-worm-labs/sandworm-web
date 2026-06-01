import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AllConfigType } from '@/config/config.type';
import { WorkspaceService } from '@/features/workspace/service/workspace.service';
import { GeneratorContext, BaseEditRequest } from '../types/generator.types';

export type MarkdownGeneratorContext = GeneratorContext;

export interface MarkdownGeneratorResponse {
  content: string;
}

@Injectable()
export class MarkdownGeneratorService {
  private readonly logger = new Logger(MarkdownGeneratorService.name);

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly httpService: HttpService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async edit(context: MarkdownGeneratorContext, prompt: string): Promise<MarkdownGeneratorResponse> {
    const { url, handshakeToken } = this.configService.getOrThrow('ai', { infer: true });

    const workspace = await this.workspaceService.getWorkspaceById(context.workspace_id);
    const openrouter_api_key = await this.workspaceService.getWorkspaceAiKey(workspace.id);
    this.logger.log(`Editing markdown for document: ${context.document_id}`);

    const { data } = await firstValueFrom(
      this.httpService.post<MarkdownGeneratorResponse>(
        `${url}/markdown/edit`,
        {
          openrouter_api_key,
          prompt,
          model: workspace.assistantModel,
          context,
        } satisfies BaseEditRequest,
        { headers: { 'Content-Type': 'application/json', 'x-handshake-token': handshakeToken } },
      ),
    );
    return data;
  }
}
