import clsx from "clsx";
import { Card } from "@sandworm/ui/kit/card";
import { TONE_TEXT_CLASSNAME } from "@sandworm/ui/kit/tone";

import type { KpisBlock } from "@/lib/overview/types";

export function KpisCard({ block }: { block: KpisBlock }) {
  return (
    <Card
      aria-label={block.title}
      className="grid h-full grid-cols-[repeat(auto-fit,minmax(200px,1fr))] overflow-hidden"
    >
      {block.items.map(item => (
        <div
          key={item.id}
          className="flex flex-col gap-1 border-r border-border-secondary px-6 py-5 last:border-r-0"
        >
          <span className="text-[13px] text-ink-400">{item.label}</span>
          <span className="text-[28px] font-medium leading-[1.15] text-ink-100">
            {item.value}
          </span>
          <span className="text-xs">
            <span
              className={clsx("font-medium", TONE_TEXT_CLASSNAME[item.tone])}
            >
              {item.delta}
            </span>
            {item.comparison && (
              <span className="text-ink-400"> {item.comparison}</span>
            )}
          </span>
        </div>
      ))}
    </Card>
  );
}
