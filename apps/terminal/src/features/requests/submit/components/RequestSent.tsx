import { PiCheck } from "react-icons/pi";

import { AppLink } from "@/components/AppLink";
import { buttonClassName } from "@/components/Button";
import { site } from "@/config/site";

import { Timeline } from "../../components/Timeline";
import { describeDraft, submittedTimeline } from "../draft";
import type { RequestDraft } from "../types";

type RequestSentProps = {
  draft: RequestDraft;
  submittedAt: string;
};

export function RequestSent({ draft, submittedAt }: RequestSentProps) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-start gap-2.5 px-8 pb-2 pt-7">
        <span
          aria-hidden="true"
          className="flex size-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
        >
          <PiCheck size={20} />
        </span>
        <h2 className="mt-1 text-xl font-medium text-ink-100">
          Request sent to {site.name}
        </h2>
        <p className="text-sm leading-[1.55] text-ink-500">
          They&apos;ll come back with a scope: what they&apos;ll answer, how,
          and when. Nothing counts toward your allowance until you approve it.
        </p>
      </div>
      <div className="mx-8 mt-4">
        <Timeline
          label="What happens next"
          size="md"
          steps={submittedTimeline(submittedAt)}
        />
      </div>
      <div className="mx-8 mt-1 flex flex-col gap-1 rounded-xl bg-inputBg px-4 py-3.5 ring-1 ring-inset ring-border-secondary">
        <span className="text-xs font-medium text-ink-400">Your request</span>
        <span className="whitespace-pre-line break-words text-ink-100">
          {draft.question.trim()}
        </span>
        <span className="text-xs text-ink-400">{describeDraft(draft)}</span>
      </div>
      <div className="mt-6 flex justify-end gap-2 border-t border-border-secondary px-6 py-3.5">
        <AppLink
          route="overview"
          className={buttonClassName({ variant: "secondary" })}
        >
          Back to Overview
        </AppLink>
        <AppLink route="requests" className={buttonClassName()}>
          View your requests
        </AppLink>
      </div>
    </div>
  );
}
