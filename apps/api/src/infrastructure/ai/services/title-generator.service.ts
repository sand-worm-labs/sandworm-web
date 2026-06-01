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
  message: string;
  openrouter_api_key: string;
  model: string;
  context: TitleGeneratorContext;
}


export interface GenerateTitleResponse {
  title: string;
}

const changeTitleMessage = "Change the title of the document"

@Injectable()
export class TitleGeneratorService {
  private readonly logger = new Logger(TitleGeneratorService.name);

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly httpService: HttpService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async generateTitle(request: TitleGeneratorContext, oldTitle: string): Promise<GenerateTitleResponse> {
    const { url, handshakeToken } = this.configService.getOrThrow('ai', { infer: true });

    const workspace = await this.workspaceService.getWorkspaceById(request.workspace_id);
    const workspace_model = workspace.assistantModel;
    const openrouter_api_key = await this.workspaceService.getWorkspaceAiHash(workspace.id);
    this.logger.log(`Generating title for document: ${request.document_id}`);

    const { data } = await firstValueFrom(
      this.httpService.post<GenerateTitleResponse>(
          `${url}/document/generate-title`,
          {
            openrouter_api_key:`OPENROUTER_KEY_PLACEHOLDER`,
            message: `${changeTitleMessage}: ${oldTitle}`,
            model: workspace_model,
            context: request,
          } satisfies GenerateTitleRequest,
          { headers: { 'Content-Type': 'application/json', 'x-handshake-token': handshakeToken } },
        ),
    );
    return  data;
  };
}