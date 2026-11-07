import { Card } from "@sandworm/ui/kit/card";
import { ROW_HOVER_CLASSNAME } from "@sandworm/ui/kit/interactive";

import { AppLink } from "@/components/AppLink";
import { SignalStatusIcon } from "@/components/Signals/SignalStatusIcon";
import type { SignalListBlock } from "@/types";

export function SignalList({ block }: { block: SignalListBlock }) {
  const titleId = `${block.id}-title`;

  return (
    <Card aria-labelledby={titleId} className="px-2 pb-2.5 pt-[22px]">
      <h2 id={titleId} className="px-3 pb-2 text-base font-medium text-ink-100">
        {block.title}
      </h2>
      {block.items.map((item, index) => (
        <div
          key={item.id}
          className={index > 0 ? "border-t border-border-secondary" : undefined}
        >
          <AppLink
            route="signal"
            className={`${ROW_HOVER_CLASSNAME} grid grid-cols-[14px_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3.5`}
          >
            <SignalStatusIcon status={item.status} />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-medium text-ink-100">
                {item.title}
              </span>
              <span className="text-xs text-ink-400">
                {item.status} · {item.confidence} confidence
              </span>
            </span>
            <span className="whitespace-nowrap text-sm font-medium text-ink-100">
              {item.value}
            </span>
          </AppLink>
        </div>
      ))}
    </Card>
  );
}
