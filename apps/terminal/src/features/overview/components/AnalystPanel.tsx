import { buttonClassName } from "@sandworm/ui/kit/button";
import { Card } from "@sandworm/ui/kit/card";
import { InitialsAvatar } from "@sandworm/ui/kit/initials-avatar";

import { AppLink } from "@/components/AppLink";
import type { Analyst } from "@/features/session/types";

type AnalystPanelProps = {
  id: string;
  title: string;
  analyst: Analyst;
  message: string;
  footnote?: string;
  actionLabel?: string;
};

export function AnalystPanel({
  id,
  title,
  analyst,
  message,
  footnote,
  actionLabel = "Book a call",
}: AnalystPanelProps) {
  return (
    <Card
      tone="muted"
      aria-labelledby={id}
      className="flex h-full flex-col gap-3.5 px-6 py-[22px]"
    >
      <h2 id={id} className="text-base font-medium text-ink-100">
        {title}
      </h2>
      <div className="flex items-center gap-2.5">
        <InitialsAvatar initials={analyst.initials} />
        <span className="flex flex-col leading-[1.3]">
          <span className="text-sm font-medium text-ink-100">
            {analyst.fullName}
          </span>
          <span className="text-xs text-ink-400">{analyst.role}</span>
        </span>
      </div>
      <p className="text-ink-500">{message}</p>
      <AppLink
        route="bookCall"
        className={buttonClassName({
          variant: "secondary",
          className: "w-full bg-block-surface",
        })}
      >
        {actionLabel}
      </AppLink>
      {footnote && (
        <span className="text-center text-xs text-ink-400">{footnote}</span>
      )}
    </Card>
  );
}
