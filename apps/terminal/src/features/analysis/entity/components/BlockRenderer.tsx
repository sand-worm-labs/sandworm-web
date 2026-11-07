import { exhaustiveCheck } from "@/lib/exhaustive";

import type { EntityBlock } from "../types";

import { DataTable } from "./DataTable";
import { OpportunityList } from "./OpportunityList";
import { ReportList } from "./ReportList";

export function BlockRenderer({ block }: { block: EntityBlock }) {
  switch (block._tag) {
    case "dataTable":
      return <DataTable block={block} />;
    case "reportList":
      return <ReportList block={block} />;
    case "opportunityList":
      return <OpportunityList block={block} />;
    default:
      return exhaustiveCheck(block);
  }
}
