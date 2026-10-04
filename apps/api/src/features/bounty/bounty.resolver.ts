import { Args, Query, Resolver } from '@nestjs/graphql';
import { Public } from '@sandworm/nest-common';
import { Bounty } from './bounty.model';
import { BountyService } from './bounty.service';

@Resolver(() => Bounty)
export class BountyResolver {
  constructor(private readonly bountyService: BountyService) { }

  // Public: the bounties pages and the landing site show these to visitors.
  @Public()
  @Query(() => [Bounty], {
    name: 'getBounties',
    description: 'Get the bounties, in display order. Pass featured to get only the ones shown on the home page.',
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
    description: 'Get one bounty by its slug, or null when there is none.',
  })
  getBounty(@Args('slug') slug: string): Promise<Bounty | null> {
    return this.bountyService.getBounty(slug);
  }
}
