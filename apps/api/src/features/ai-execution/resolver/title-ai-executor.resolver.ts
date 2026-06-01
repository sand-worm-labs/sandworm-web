import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { TitleAiExecutorService } from '../service/title-ai-executor.service';
import { TitleGeneratorService} from "@/infrastructure/ai/services/title-generator.service"; 
import { CurrentUser } from '@sandworm/graphql';

@Resolver()
export class TitleAiExecutorResolver {
    constructor(
        private readonly titleAiExecutorService: TitleAiExecutorService,
        private readonly titleGeneratorService: TitleGeneratorService
    ) {}
 
    @Mutation(() => String)
    async editTitleWithAi(
        @CurrentUser("id") userId: string,
        @Args('documentId') documentId: string,
        @Args('workspaceId') workspaceId: string,
    ): Promise<string> {
        const existingTitle = await this.titleAiExecutorService.getTitle(documentId, workspaceId);
        const { title } = await this.titleGeneratorService.generateTitle({
            user_id: userId,
            workspace_id: workspaceId,
            document_id: documentId,
        }, existingTitle);
        await this.titleAiExecutorService.updateTitle(documentId, workspaceId,title);
        return title;
    }
}
