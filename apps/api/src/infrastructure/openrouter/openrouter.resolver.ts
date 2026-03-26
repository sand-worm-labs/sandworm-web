import { Args, Query, Resolver } from '@nestjs/graphql';
import { OpenRouterService } from './openrouter.service';
import { OpenRouterModel, OpenRouterAccountCredits } from './model/openrouter.model';

@Resolver(() => OpenRouterModel)
export class OpenRouterResolver {
  constructor(private readonly openRouterService: OpenRouterService) { }

  @Query(() => [OpenRouterModel], {
    name: 'openRouterModels',
    description: 'List all available OpenRouter models',
  })
  async getModels(): Promise<OpenRouterModel[]> {
    return this.openRouterService.getModels();
  }

  @Query(() => OpenRouterModel, {
    name: 'openRouterModel',
    description: 'Get a specific OpenRouter model by ID',
    nullable: true,
  })
  async getModel(
    @Args('modelId', { type: () => String }) modelId: string,
  ): Promise<OpenRouterModel | null> {
    return this.openRouterService.getModel(modelId);
  }

  @Query(() => OpenRouterAccountCredits, {
    name: 'openRouterAccountCredits',
    description: 'Get OpenRouter account credit usage',
  })
  async getAccountCredits(
    @Args('workspaceId') workspaceId: string,
  ): Promise<OpenRouterAccountCredits> {
      return this.openRouterService.getAccountCredits(workspaceId);
  }
}
