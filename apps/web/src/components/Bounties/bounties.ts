import type { GetBountiesQuery } from "@/generated/graphql";

// Bounties are stored in the API's bounty table: add, close and award them
// there. The landing site's home page shows the ones marked as featured.
export type Bounty = GetBountiesQuery["getBounties"][number];

// The tag an entry is published with, so entries for a bounty can be found.
export const bountyTag = (slug: string) => `bounty-${slug}`;
