import { buttonClassName } from "@sandworm/ui/kit/button";
import { Card } from "@sandworm/ui/kit/card";
import { ProgressMeter } from "@sandworm/ui/kit/progress-meter";

import { AppLink } from "@/components/AppLink";

import { BlockHeader } from "../components/BlockHeader";
import type { AllowanceBlock } from "../types";

export function AllowanceCard({ block }: { block: AllowanceBlock }) {
  const titleId = `${block.id}-title`;

  return (
    <Card
      aria-labelledby={titleId}
      className="flex h-full flex-col gap-4 px-6 py-[22px]"
    >
      <BlockHeader id={titleId} title={block.title} subtitle={block.subtitle} />
      {block.meters.map(meter => (
        <div key={meter.id} className="flex flex-col gap-1.5">
          <div className="flex justify-between gap-2">
            <span className="font-medium">{meter.label}</span>
            <span className="text-ink-500">
              <span className="font-medium text-ink-100">{meter.used}</span> of{" "}
              {meter.total} used
            </span>
          </div>
          <ProgressMeter
            value={meter.used}
            max={meter.total}
            tone={meter.tone}
          />
        </div>
      ))}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <AppLink route="commission" className={buttonClassName()}>
          Commission research
        </AppLink>
        <AppLink
          route="requests"
          className={buttonClassName({
            variant: "link",
            className: "font-medium",
          })}
        >
          View requests
        </AppLink>
      </div>
    </Card>
  );
}
