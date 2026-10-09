import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AllConfigType } from '@/config/config.type';
import { AuthService } from '@/features/auth/core/auth.service';
import { WorkspaceService } from '@/features/workspace/service/workspace.service';

export interface TitleGeneratorContext {
  user_id: string;
  workspace_id: string;
  document_id: string;
  chat_id?: string;
}

export interface GenerateTitleResponse {
  title: string;
}

// Asks the AI service to rename a notebook. It has the MCP server change the
// title itself, as the user, so their access token goes with the request and
// nothing here needs to write the new title.
@Injectable()
export class TitleGeneratorService {
  private readonly logger = new Logger(TitleGeneratorService.name);

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly httpService: HttpService,
    private readonly workspaceService: WorkspaceService,
    private readonly authService: AuthService,
  ) {}

  async generateTitle(request: TitleGeneratorContext): Promise<GenerateTitleResponse> {
    const { url, handshakeToken } = this.configService.getOrThrow('ai', { infer: true });

    const workspace = await this.workspaceService.getWorkspaceById(request.workspace_id);
    const openrouter_api_key = await this.workspaceService.getWorkspaceAiKey(workspace.id);
    const { accessToken } = await this.authService.issueTokenPair(request.user_id);
    this.logger.log(`Renaming document: ${request.document_id}`);

    const { data } = await firstValueFrom(
      this.httpService.post<GenerateTitleResponse>(
        `${url}/notebook/title`,
        {
          openrouter_api_key,
          model: workspace.assistantModel,
          context: { ...request, user_token: accessToken },
        },
        { headers: { 'Content-Type': 'application/json', 'x-handshake-token': handshakeToken } },
      ),
    );
    return data;
  }
}
