import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { CurrentUser } from '@sandworm/graphql'
import { TextAiExecutorService } from '../service/text-ai-executor.service'
import { AiResult } from '../dto/fix-ai-result.dto'

@Resolver()
export class TextAiExecutorResolver {
  constructor(private readonly textAiExecutorService: TextAiExecutorService) {}

  @Mutation(() => AiResult)
  async editTextWithAi(
    @CurrentUser('id') userId: string,
    @Args('documentId') documentId: string,
    @Args('workspaceId') workspaceId: string,
    @Args('blockId') blockId: string,
  ): Promise<AiResult> {
    return this.textAiExecutorService.editAiText(documentId, workspaceId, blockId, userId)
  }
}