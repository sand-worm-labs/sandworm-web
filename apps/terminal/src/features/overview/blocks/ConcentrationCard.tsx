import clsx from "clsx";
import { Card, cardRowDividerClassName } from "@sandworm/ui/kit/card";

import { BlockHeader } from "../components/BlockHeader";
import type { ConcentrationBlock } from "../types";

const segmentClassNames = [
  "bg-primary",
  "bg-primary-200",
  "bg-border-secondary ring-1 ring-inset ring-border-faint",
] as const;

function segmentClassName(index: number): string {
  return segmentClassNames[index] ?? segmentClassNames[2];
}

export function ConcentrationCard({ block }: { block: ConcentrationBlock }) {
  const titleId = `${block.id}-title`;
  const description = block.segments
    .map(segment => `${segment.label} ${segment.share} percent`)
    .join(", ");

  return (
    <Card
      aria-labelledby={titleId}
      className="flex h-full flex-col gap-4 px-6 py-[22px]"
    >
      <BlockHeader id={titleId} title={block.title} subtitle={block.summary} />
      <div
        role="img"
        aria-label={description}
        className="flex h-7 gap-0.5 overflow-hidden rounded-lg"
      >
        {block.segments.map((segment, index) => (
          <span
            key={segment.id}
            className={clsx("block h-7", segmentClassName(index))}
            style={{ width: `${segment.share}%` }}
          />
        ))}
      </div>
      <div className="flex flex-col">
        {block.segments.map((segment, index) => (
          <div
            key={segment.id}
            className={clsx(
              "grid grid-cols-[12px_minmax(0,1fr)_90px_52px] items-center gap-2.5 py-2.5",
              cardRowDividerClassName
            )}
          >
            <span
              aria-hidden="true"
              className={clsx(
                "size-2.5 rounded-[3px]",
                segmentClassName(index)
              )}
            />
            <span>{segment.label}</span>
            <span className="text-right text-ink-400">{segment.count}</span>
            <span className="text-right font-medium text-ink-100">
              {segment.share}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
