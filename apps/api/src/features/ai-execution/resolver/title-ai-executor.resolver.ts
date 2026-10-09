import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { TitleGeneratorService } from '@/infrastructure/ai/services/title-generator.service';
import { ChatService } from '@/features/chat/chat.service';
import { CurrentUser } from '@sandworm/graphql';

@Resolver()
export class TitleAiExecutorResolver {
    constructor(
        private readonly titleGeneratorService: TitleGeneratorService,
        private readonly chatService: ChatService,
    ) {}

    // The AI service renames the notebook through the MCP server, so the new
    // title is already saved by the time this returns. The rename is added to the
    // notebook's latest chat; a chat is never created for it.
    @Mutation(() => String)
    async editTitleWithAi(
        @CurrentUser("id") userId: string,
        @Args('documentId') documentId: string,
        @Args('workspaceId') workspaceId: string,
    ): Promise<string> {
        const chatId = await this.chatService.latestChatId(userId, { workspaceId, documentId });
        const { title } = await this.titleGeneratorService.generateTitle({
            user_id: userId,
            workspace_id: workspaceId,
            document_id: documentId,
            chat_id: chatId,
        });
        return title;
    }
}
