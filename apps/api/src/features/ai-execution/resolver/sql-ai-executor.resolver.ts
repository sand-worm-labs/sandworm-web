import { Args,Mutation, Resolver } from '@nestjs/graphql';
import { SqlAiExecutorService } from '../service/sql-ai-executor.service';
import { CurrentUser } from '@sandworm/graphql';

@Resolver()
export class SqlAiExecutorResolver {
  constructor(private readonly sqlAiExecutorService: SqlAiExecutorService) {}

  @Mutation(() => String)
  async editSqlWithAi(
    @CurrentUser("id") userId: string,
    @Args('documentId') documentId: string,
    @Args('workspaceId') workspaceId: string,
    @Args('blockId') blockId: string,
    @Args('instructions') instructions: string,
    @Args('dialect', { defaultValue: 'sql' }) dialect: string,
    @Args('query') query: string,
    @Args('modelId') modelId: string,
  ): Promise<string> {

    return this.sqlAiExecutorService.editSql(
      documentId,
      workspaceId,
      blockId,
      userId,
      {
        query,
        instructions,
        dialect,
        modelId,
      },
    );
  }
}