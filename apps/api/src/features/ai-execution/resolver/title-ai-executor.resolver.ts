import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { TitleAiExecutorService } from '../service/title-ai-executor.service';
 
const RANDOM_TITLES = [
    'Onchain Analytics Deep Dive',
    'DeFi Protocol Breakdown',
    'Token Flow Analysis',
    'Wallet Behaviour Patterns',
    'Liquidity Pool Diagnostics',
    'MEV Extraction Study',
    'Gas Usage Heatmap',
    'Bridge Activity Report',
    'Stablecoin Depeg Forensics',
    'NFT Market Pulse',
];
 
@Resolver()
export class TitleAiExecutorResolver {
    constructor(private readonly titleAiExecutorService: TitleAiExecutorService) {}
 
    @Mutation(() => String)
    async editTitleWithAi(
        @Args('documentId') documentId: string,
        @Args('workspaceId') workspaceId: string,
    ): Promise<string> {
        const title = RANDOM_TITLES[Math.floor(Math.random() * RANDOM_TITLES.length)];
        await this.titleAiExecutorService.updateTitle(documentId, workspaceId, title);
        return title;
    }
}
