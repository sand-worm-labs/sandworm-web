import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { CurrentUser } from '@sandworm/graphql'
import { TextAiExecutorService } from '../service/text-ai-executor.service'

@Resolver()
export class TextAiExecutorResolver {
  constructor(private readonly textAiExecutorService: TextAiExecutorService) {}

  @Mutation(() => String)
  async editTextWithAi(
    @CurrentUser('id') userId: string,
    @Args('documentId') documentId: string,
    @Args('workspaceId') workspaceId: string,
    @Args('blockId') blockId: string,
  ): Promise<string> {
    return this.textAiExecutorService.editAiText(documentId, workspaceId, blockId, userId)
  }
}