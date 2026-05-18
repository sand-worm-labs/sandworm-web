import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';

@Resolver()
export class ToolsAiExecutorResolver {

  @Mutation(() => String)
  async editToolWithAi(
    @CurrentUser('id') userId: string,
    @Args('documentId') documentId: string,
    @Args('workspaceId') workspaceId: string,
    @Args('blockId') blockId: string,
    @Args('modelId') modelId: string,
  ): Promise<string> {
    return "true"
    //return this.textAiExecutorService.editText(documentId, workspaceId, blockId, userId, modelId)
  }
}