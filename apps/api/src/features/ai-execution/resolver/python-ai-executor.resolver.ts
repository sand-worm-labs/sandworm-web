import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { PythonAiExecutorService } from '../service/python-ai-executor.service';
import { CurrentUser } from '@sandworm/graphql';

@Resolver()
export class PythonAiExecutorResolver {
  constructor(private readonly pythonAiExecutorService: PythonAiExecutorService) {}

  @Mutation(() => String)
  async editPythonWithAi(
    @Args('documentId') documentId: string,
    @Args('workspaceId') workspaceId: string,
    @Args('blockId') blockId: string,
    @Args('modelId') modelId: string,
    @CurrentUser('id') userId: string,
  ): Promise<string> {
    return this.pythonAiExecutorService.editPython(documentId, workspaceId, blockId, userId, modelId);
  }

}
