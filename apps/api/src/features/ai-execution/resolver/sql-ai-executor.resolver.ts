import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';
import { SqlAiExecutorService } from '../service/sql-ai-executor.service';
import { AiResult } from '../dto/fix-ai-result.dto';

@Resolver()
export class SqlAiExecutorResolver {
  constructor(private readonly sqlAiExecutorService: SqlAiExecutorService) {}

  @Mutation(() => AiResult)
  async editSqlWithAi(
    @CurrentUser('id') userId: string,
    @Args('documentId') documentId: string,
    @Args('workspaceId') workspaceId: string,
    @Args('blockId') blockId: string,
  ): Promise<AiResult> {
    return this.sqlAiExecutorService.editAiSql(documentId, workspaceId, blockId, userId);
  }

  @Mutation(() => AiResult)
  async fixSqlWithAi(
    @CurrentUser('id') userId: string,
    @Args('documentId') documentId: string,
    @Args('workspaceId') workspaceId: string,
    @Args('blockId') blockId: string,
  ): Promise<AiResult> {
    return this.sqlAiExecutorService.fixAiSql(documentId, workspaceId, blockId, userId);
  }
}