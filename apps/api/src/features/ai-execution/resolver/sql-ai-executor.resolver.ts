import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';
import { SqlAiExecutorService } from '../service/sql-ai-executor.service';
import { FixAiResult } from '../dto/fix-ai-result.dto';

@Resolver()
export class SqlAiExecutorResolver {
  constructor(private readonly sqlAiExecutorService: SqlAiExecutorService) {}

  @Mutation(() => String)
  async editSqlWithAi(
    @CurrentUser('id') userId: string,
    @Args('documentId') documentId: string,
    @Args('workspaceId') workspaceId: string,
    @Args('blockId') blockId: string,
    @Args('modelId') modelId: string,
  ): Promise<string> {
    return this.sqlAiExecutorService.editSql(documentId, workspaceId, blockId, userId, modelId);
  }

  @Mutation(() => FixAiResult)
  async fixSqlWithAi(
    @CurrentUser('id') userId: string,
    @Args('documentId') documentId: string,
    @Args('workspaceId') workspaceId: string,
    @Args('blockId') blockId: string,
    @Args('modelId') modelId: string,
  ): Promise<FixAiResult> {
    return this.sqlAiExecutorService.fixSql(documentId, workspaceId, blockId, userId, modelId);
  }
}