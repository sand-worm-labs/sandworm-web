import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AllConfigType } from '@/config/config.type';
import { WorkspaceService } from '@/features/workspace/service/workspace.service';

export interface TitleGeneratorContext {
  user_id: string;
  workspace_id: string;
  document_id: string;
}

interface GenerateTitleRequest {
  openrouter_api_key: string;
  context: TitleGeneratorContext;
}

export interface GenerateTitleResponse {
  title: string;
}

@Injectable()
export class TitleGeneratorService {
  private readonly logger = new Logger(TitleGeneratorService.name);

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly httpService: HttpService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async generateTitle(request: TitleGeneratorContext): Promise<GenerateTitleResponse> {
    const { url, handshakeToken } = this.configService.getOrThrow('ai', { infer: true });

    const workspace = await this.workspaceService.getWorkspaceById(request.workspace_id);
    const openrouter_api_key = await this.workspaceService.getWorkspaceAiHash(workspace.id);

    this.logger.log(`Generating title for document: ${request.document_id}`);

    const { data } = await firstValueFrom(
      this.httpService.post<GenerateTitleResponse>(
        `${url}/generate-title`,
        { openrouter_api_key, context: request } satisfies GenerateTitleRequest,
        { headers: { 'Content-Type': 'application/json', 'x-handshake-token': handshakeToken } },
      ),
    );

    return data;
  }
}