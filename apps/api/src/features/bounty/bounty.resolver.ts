import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';
import { Public } from '@sandworm/nest-common';
import { Bounty } from './bounty.model';
import { BountyService } from './bounty.service';
import { CreateBountyInput } from './dto/bounty.dto';

@Resolver(() => Bounty)
export class BountyResolver {
  constructor(private readonly bountyService: BountyService) { }

  @Public()
  @Query(() => [Bounty], {
    name: 'getBounties',
    description: 'Get the listed bounties, in display order. Pass featured to get only the ones shown on the home page.',
  })
  getBounties(
    @Args('featured', { type: () => Boolean, nullable: true }) featured?: boolean,
  ): Promise<Bounty[]> {
    return this.bountyService.getBounties(featured);
  }

  @Public()
  @Query(() => Bounty, {
    name: 'getBounty',
    nullable: true,
    description: 'Get one bounty by its slug. A draft is returned only to its creator.',
  })
  getBounty(
    @Args('slug') slug: string,
    @CurrentUser('id') userId?: string,
  ): Promise<Bounty | null> {
    return this.bountyService.getBounty(slug, userId);
  }

  @Query(() => [Bounty], {
    name: 'getBountyDrafts',
    description: 'Get the bounties the current user drafted in a workspace and has not funded yet.',
  })
  getBountyDrafts(
    @CurrentUser('id') userId: string,
    @Args('workspaceId') workspaceId: string,
  ): Promise<Bounty[]> {
    return this.bountyService.getBountyDrafts(workspaceId, userId);
  }

  @Mutation(() => Bounty, {
    name: 'createBounty',
    description: 'Create a bounty as a draft. It is listed once its reward is funded in escrow.',
  })
  createBounty(
    @CurrentUser('id') userId: string,
    @Args('input') input: CreateBountyInput,
  ): Promise<Bounty> {
    return this.bountyService.createBounty(input, userId);
  }
}
