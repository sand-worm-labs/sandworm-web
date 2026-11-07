import clsx from "clsx";

import { BlockRenderer } from "@/components/Overview/blocks/BlockRenderer";
import { columnSpanClassName } from "@/features/overview/placement";
import type { LayoutRow, OverviewBlock } from "@/features/overview/types";

type OverviewLayoutProps = {
  layout: readonly LayoutRow[];
  blocks: readonly OverviewBlock[];
};

function resolveColumns(
  row: LayoutRow,
  blocksById: Map<string, OverviewBlock>
) {
  return row.columns
    .map(column => ({
      span: column.span,
      blocks: column.blockIds.flatMap(id => {
        const block = blocksById.get(id);
        return block ? [block] : [];
      }),
    }))
    .filter(column => column.blocks.length > 0);
}

export function OverviewLayout({ layout, blocks }: OverviewLayoutProps) {
  const blocksById = new Map(blocks.map(block => [block.id, block]));

  return (
    <div className="flex flex-col gap-5">
      {layout.map(row => {
        const columns = resolveColumns(row, blocksById);
        if (columns.length === 0) return null;

        return (
          <div key={row.id} className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {columns.map(column => (
              <div
                key={column.blocks.map(block => block.id).join("-")}
                className={clsx(
                  "flex flex-col gap-5",
                  columnSpanClassName(column.span)
                )}
              >
                {column.blocks.map(block => (
                  <div
                    key={block.id}
                    className={clsx(
                      column.blocks.length === 1 && "flex flex-1 flex-col"
                    )}
                  >
                    <BlockRenderer block={block} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
