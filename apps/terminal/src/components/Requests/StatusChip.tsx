import clsx from "clsx";
import { TONE_BADGE_CLASSNAME } from "@sandworm/ui/kit/tone";

import type { RequestStatus } from "@/types";

const chipClassNames: Record<RequestStatus, string> = {
  Submitted: "bg-hover-bg text-ink-500",
  Scoping: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  "In progress": "bg-info-tint dark:bg-base-600 text-ink-navy",
  Delivered: TONE_BADGE_CLASSNAME.positive,
  Declined: TONE_BADGE_CLASSNAME.negative,
  Upcoming:
    "bg-primary-tint-75 dark:bg-primary-910 text-primary-700 dark:text-primary-200",
  Answered: TONE_BADGE_CLASSNAME.positive,
  Done: "bg-hover-bg text-ink-500",
};

export function StatusChip({ status }: { status: RequestStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex h-[22px] items-center self-start justify-self-start whitespace-nowrap rounded-md px-2 text-xs font-medium",
        chipClassNames[status]
      )}
    >
      {status}
    </span>
  );
}
