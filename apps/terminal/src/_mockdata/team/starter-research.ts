import type { OrganisationTypeId } from "@/data/setup/organisation-types";
import type { StarterResearch } from "@/types";
import { toId } from "@/lib/slug";

function starter(
  title: string,
  fits: string,
  data: StarterResearch["data"] = "public"
): StarterResearch {
  return { id: toId(title), title, fits, data };
}

export const starterResearchMockData: Record<
  OrganisationTypeId,
  readonly StarterResearch[]
> = {
  exchange: [
    starter(
      "Argentina's off-ramps, ranked by fees",
      "Fits: Latin America, cash-out"
    ),
    starter(
      "Paycrest: who actually cashes out in Africa",
      "Fits: cash-out, payments"
    ),
    starter(
      "Where wallet users go when they leave",
      "Fits: competitors you track"
    ),
    starter(
      "Stablecoin yields: where users earn",
      "Fits: Trading app template"
    ),
  ],
  protocol: [
    starter("Who carries DeFi deposits", "Fits: DeFi protocol template"),
    starter("Where withdrawn funds go next", "Fits: competitors you track"),
    starter("Stablecoin yields: where users earn", "Fits: lending and yield"),
  ],
  chain: [
    starter("Which apps drive a chain's activity", "Fits: Blockchain template"),
    starter("Where users bridge out to", "Fits: bridges"),
    starter("Stablecoin supply by chain", "Fits: payments"),
  ],
  vc: [
    starter("Portfolio users, project by project", "Fits: Investor template"),
    starter(
      "Competitors gaining on your holdings",
      "Fits: competitors you track"
    ),
    starter("Sectors growing where you hold nothing", "Fits: gaps"),
  ],
  accelerator: [
    starter("Onchain traction by batch", "Fits: Accelerator template"),
    starter(
      "Stalled companies: who stopped growing",
      "Fits: portfolio support"
    ),
    starter("Sectors with no company in a batch", "Fits: sourcing"),
  ],
  other: [
    starter("Who your most active users are", "Fits: General template"),
    starter("Where your users go next", "Fits: competitors you track"),
  ],
};
