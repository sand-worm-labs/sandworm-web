import type { ColumnSpan } from "@/types";

const columnSpanClassNames: Record<ColumnSpan, string> = {
  4: "lg:col-span-4",
  6: "lg:col-span-6",
  8: "lg:col-span-8",
  12: "lg:col-span-12",
};

export function columnSpanClassName(span: ColumnSpan): string {
  return columnSpanClassNames[span];
}
