import clsx from "clsx";
import { TONE_BADGE_CLASSNAME } from "@sandworm/ui/kit/tone";

import type { ClientStatusId } from "@/lib/team/types";

const STATUS: Record<ClientStatusId, { label: string; className: string }> = {
  setting_up: {
    label: "Setting up",
    className: "bg-info-tint text-ink-navy dark:bg-base-600",
  },
  invite_sent: {
    label: "Invite sent",
    className:
      "bg-primary-tint-75 text-primary-700 dark:bg-primary-910 dark:text-primary-200",
  },
  live: { label: "Live", className: TONE_BADGE_CLASSNAME.positive },
};

export function ClientStatusChip({ status }: { status: ClientStatusId }) {
  return (
    <span
      className={clsx(
        "inline-flex h-[22px] items-center whitespace-nowrap rounded-md px-2 text-xs font-medium",
        STATUS[status].className
      )}
    >
      {STATUS[status].label}
    </span>
  );
}
