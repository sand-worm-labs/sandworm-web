import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AllConfigType } from '@/config/config.type';
import { WorkspaceService } from '@/features/workspace/service/workspace.service';
import { GeneratorContext, BaseEditRequest, BaseFixRequest } from '../types/generator.types';

export type PythonGeneratorContext = GeneratorContext;

export interface PythonGeneratorResponse {
  code: string;
}

@Injectable()
export class PythonGeneratorService {
  private readonly logger = new Logger(PythonGeneratorService.name);

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly httpService: HttpService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async edit(context: PythonGeneratorContext, prompt: string): Promise<PythonGeneratorResponse> {
    const { url, handshakeToken } = this.configService.getOrThrow('ai', { infer: true });

    const workspace = await this.workspaceService.getWorkspaceById(context.workspace_id);
    this.logger.log(`Editing Python code for document: ${context.document_id}`);

    const { data } = await firstValueFrom(
      this.httpService.post<PythonGeneratorResponse>(
        `${url}/code/edit`,
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

  async fix(context: PythonGeneratorContext, error_message: string): Promise<PythonGeneratorResponse> {
    const { url, handshakeToken } = this.configService.getOrThrow('ai', { infer: true });

    const workspace = await this.workspaceService.getWorkspaceById(context.workspace_id);
    this.logger.log(`Fixing Python code for document: ${context.document_id}`);

    const { data } = await firstValueFrom(
      this.httpService.post<PythonGeneratorResponse>(
        `${url}/code/fix`,
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
