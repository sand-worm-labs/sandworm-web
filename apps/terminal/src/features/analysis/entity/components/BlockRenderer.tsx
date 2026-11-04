import { exhaustiveCheck } from "@/lib/exhaustive";

import type { EntityBlock } from "../types";

import { BarList } from "./BarList";
import { ColumnChart } from "./ColumnChart";
import { DataTable } from "./DataTable";
import { LineChart } from "./LineChart";
import { OpportunityList } from "./OpportunityList";
import { ReportList } from "./ReportList";

export function BlockRenderer({ block }: { block: EntityBlock }) {
  switch (block._tag) {
    case "columnChart":
      return <ColumnChart block={block} />;
    case "barList":
      return <BarList block={block} />;
    case "lineChart":
      return <LineChart block={block} />;
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
