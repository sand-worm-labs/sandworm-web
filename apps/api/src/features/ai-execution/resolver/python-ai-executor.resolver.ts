import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';
import { PythonAiExecutorService } from '../service/python-ai-executor.service';
import { AiResult } from '../dto/fix-ai-result.dto';

@Resolver()
export class PythonAiExecutorResolver {
  constructor(private readonly pythonAiExecutorService: PythonAiExecutorService) {}

  @Mutation(() => AiResult)
  async editPythonWithAi(
    @CurrentUser('id') userId: string,
    @Args('documentId') documentId: string,
    @Args('workspaceId') workspaceId: string,
    @Args('blockId') blockId: string
  ): Promise<AiResult> {
    return this.pythonAiExecutorService.editAiPython(documentId, workspaceId, blockId, userId);
  }

  @Mutation(() => AiResult)
  async fixPythonWithAi(
    @CurrentUser('id') userId: string,
    @Args('documentId') documentId: string,
    @Args('workspaceId') workspaceId: string,
    @Args('blockId') blockId: string
  ): Promise<AiResult> {
    return this.pythonAiExecutorService.fixAiPython(documentId, workspaceId, blockId, userId);
  }
}