import clsx from "clsx";
import { Card } from "@sandworm/ui/kit/card";

import { BlockHeader } from "../components/BlockHeader";
import type { DestinationsBlock } from "../types";

type BarTone = DestinationsBlock["tone"];

const barClassNames: Record<BarTone, string> = {
  navy: "bg-ink-navy",
  loss: "bg-red-300",
  brand: "bg-primary",
};

const labelClassNames: Record<BarTone, string> = {
  navy: "text-ink-100",
  loss: "text-red-700 dark:text-red-400",
  brand: "text-ink-100",
};

export function DestinationsCard({ block }: { block: DestinationsBlock }) {
  const titleId = `${block.id}-title`;

  return (
    <Card
      aria-labelledby={titleId}
      className="flex h-full flex-col gap-4 px-6 py-[22px]"
    >
      <BlockHeader id={titleId} title={block.title} subtitle={block.summary} />
      <div className="flex flex-col gap-3">
        {block.rows.map(row => (
          <div
            key={row.id}
            className="grid grid-cols-[minmax(120px,1.1fr)_minmax(0,1.4fr)_56px] items-center gap-3"
          >
            <span className="truncate">{row.name}</span>
            <span className="block h-2.5 overflow-hidden rounded-[5px] bg-hover-bg">
              <span
                className={clsx(
                  "block h-2.5 rounded-[5px]",
                  row.name === "Others"
                    ? "bg-border-faint"
                    : barClassNames[block.tone]
                )}
                style={{ width: `${row.share}%` }}
              />
            </span>
            <span
              className={clsx(
                "text-right font-medium",
                labelClassNames[block.tone]
              )}
            >
              {row.label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
