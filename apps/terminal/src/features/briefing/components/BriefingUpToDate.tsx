import { PiCheckCircle } from "react-icons/pi";

import { AppLink } from "@/components/AppLink";
import { buttonClassName } from "@/components/Button";
import { Card } from "@/components/Card";

type BriefingUpToDateProps = { message: string; archivedCount: number };

export function BriefingUpToDate({
  message,
  archivedCount,
}: BriefingUpToDateProps) {
  return (
    <Card
      aria-labelledby="briefing-up-to-date"
      className="flex flex-col items-center gap-3.5 px-8 py-[72px] text-center"
    >
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-full bg-base-600 text-ink-navy"
      >
        <PiCheckCircle size={30} />
      </span>
      <h2 id="briefing-up-to-date" className="text-xl font-medium text-ink-100">
        You&apos;re up to date
      </h2>
      <p className="max-w-[460px] text-sm leading-[1.55] text-ink-500">
        {message}
      </p>
      <div className="mt-1.5 flex flex-wrap justify-center gap-2">
        <AppLink
          route="analysis"
          className={buttonClassName({ variant: "secondary" })}
        >
          Browse analysis
        </AppLink>
        <AppLink route="commission" className={buttonClassName()}>
          Commission research
        </AppLink>
      </div>
      <AppLink
        route="briefingArchive"
        className={buttonClassName({
          variant: "link",
          className: "mt-2.5 text-[13px] font-medium",
        })}
      >
        See last week&apos;s {archivedCount} items
      </AppLink>
    </Card>
  );
}
