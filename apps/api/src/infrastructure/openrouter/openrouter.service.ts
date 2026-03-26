import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenRouter } from '@openrouter/sdk';
import { AllConfigType } from '@/config/config.type';
import {
  type GetKeyRequest,
  type ListRequest,
  type UpdateKeysRequest,
  type DeleteKeysRequest,
  type CreateKeysRequest,
  CreateKeysLimitReset,
} from '@openrouter/sdk/models/operations';
import { OpenRouterModel } from './model/openrouter.model';

export interface AccountCredits {
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
}

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);
  private readonly client: OpenRouter;

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    this.client = new OpenRouter({
      apiKey: this.configService.getOrThrow('openrouter.provisioningKey', { infer: true }),
    });
  }

  async provisionKey(workspaceId: string, limitUsd?: number) {
    const { defaultCap, limitReset, provisioningKey } = this.configService.get('openrouter', { infer: true });
    console.dir({defaultCap, limitReset, provisioningKey}, {depth: 1})
    const limit = limitUsd ?? defaultCap ?? 2.0;
    const limitResetType = (limitReset as CreateKeysLimitReset) ?? CreateKeysLimitReset.Monthly;
    const request: CreateKeysRequest = {
      requestBody: {
        name: `workspace-${workspaceId}`,
        limit,
        limitReset: limitResetType,
      },
    };
    return this.client.apiKeys.create(request);
  }

  async getKey(keyHash: string) {
    const request: GetKeyRequest = { hash: keyHash };
    return this.client.apiKeys.get(request);
  }

  async listKeys(offset?: string) {
    const request: ListRequest = { offset };
    return this.client.apiKeys.list(request);
  }

  async updateKey(
    keyHash: string,
    data: {
      name?: string;
      limit?: number;
      disabled?: boolean;
      limitReset?: 'daily' | 'weekly' | 'monthly';
      includeByokInLimit?: boolean;
    },
  ) {
    const request: UpdateKeysRequest = {
      hash: keyHash,
      requestBody: data,
    };
    return this.client.apiKeys.update(request);
  }

  async revokeKey(keyHash: string): Promise<void> {
    this.logger.log(`Revoking OpenRouter key ${keyHash}`);

    const request: DeleteKeysRequest = { hash: keyHash };
    await this.client.apiKeys.delete(request).catch((err) =>
      this.logger.warn(`Failed to revoke OpenRouter key ${keyHash}: ${err.message}`),
    );
  }

  async validateUserKey(key: string): Promise<boolean> {
    try {
      await new OpenRouter({ apiKey: key }).apiKeys.getCurrentKeyMetadata();
      return true;
    } catch {
      return false;
    }
  }

  async getAccountCredits(workspaceId: string): Promise<AccountCredits> {
    const { data } = await this.client.credits.getCredits();

    return {
      totalCredits: data.totalCredits,
      usedCredits: data.totalUsage,
      availableCredits: data.totalCredits - data.totalUsage,
    };
  }

  async getModels(): Promise<OpenRouterModel[]> {
    const { data } = await this.client.models.list();
    return data.map(model => {
      const { id, name, ...details } = model;
      return {id: model.id,name: model.name,details }
    });
  }

  async getModel(modelId: string): Promise<OpenRouterModel| null> {
    const models = await this.getModels();
    return models.find((m) => m.id === modelId) ?? null;
  }

  getScopedClient(workspaceKey: string): OpenRouter {
    return new OpenRouter({ apiKey: workspaceKey });
  }

  resolveKey(workspace: {
    ownApiKey?: string | null;
    provisionedKey?: string | null;
  }): string | null {
    return workspace.ownApiKey ?? workspace.provisionedKey ?? null;
  }
}