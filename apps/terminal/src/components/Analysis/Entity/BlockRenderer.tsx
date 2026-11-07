import { exhaustiveCheck } from "@/lib/exhaustive";
import type { EntityBlock } from "@/features/analysis/entity/types";

import { DataTable } from "./DataTable";
import { SignalList } from "./SignalList";
import { ReportList } from "./ReportList";

export function BlockRenderer({ block }: { block: EntityBlock }) {
  switch (block._tag) {
    case "dataTable":
      return <DataTable block={block} />;
    case "reportList":
      return <ReportList block={block} />;
    case "signalList":
      return <SignalList block={block} />;
    default:
      return exhaustiveCheck(block);
  }
}
