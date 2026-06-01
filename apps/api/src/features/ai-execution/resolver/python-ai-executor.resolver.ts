import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';
import { PythonAiExecutorService } from '../service/python-ai-executor.service';
import { FixAiResult } from '../dto/fix-ai-result.dto';

@Resolver()
export class PythonAiExecutorResolver {
  constructor(private readonly pythonAiExecutorService: PythonAiExecutorService) {}

  @Mutation(() => String)
  async editPythonWithAi(
    @CurrentUser('id') userId: string,
    @Args('documentId') documentId: string,
    @Args('workspaceId') workspaceId: string,
    @Args('blockId') blockId: string
  ): Promise<string> {
    return this.pythonAiExecutorService.editPython(documentId, workspaceId, blockId, userId);
  }

  @Mutation(() => FixAiResult)
  async fixPythonWithAi(
    @CurrentUser('id') userId: string,
    @Args('documentId') documentId: string,
    @Args('workspaceId') workspaceId: string,
    @Args('blockId') blockId: string
  ): Promise<FixAiResult> {
    return this.pythonAiExecutorService.fixPython(documentId, workspaceId, blockId, userId);
  }
}