import { exhaustiveCheck } from "@/lib/exhaustive";

import type { OverviewBlock } from "../types";

import { AllowanceCard } from "./AllowanceCard";
import { AnalystCard } from "./AnalystCard";
import { BriefingCard } from "./BriefingCard";
import { ConcentrationCard } from "./ConcentrationCard";
import { DestinationsCard } from "./DestinationsCard";
import { GapsCard } from "./GapsCard";
import { KpisCard } from "./KpisCard";
import { OpportunitiesCard } from "./OpportunitiesCard";

export function BlockRenderer({ block }: { block: OverviewBlock }) {
  switch (block._tag) {
    case "kpis":
      return <KpisCard block={block} />;
    case "briefing":
      return <BriefingCard block={block} />;
    case "allowance":
      return <AllowanceCard block={block} />;
    case "analyst":
      return <AnalystCard block={block} />;
    case "opportunities":
      return <OpportunitiesCard block={block} />;
    case "concentration":
      return <ConcentrationCard block={block} />;
    case "destinations":
      return <DestinationsCard block={block} />;
    case "gaps":
      return <GapsCard block={block} />;
    default:
      return exhaustiveCheck(block);
  }
}
