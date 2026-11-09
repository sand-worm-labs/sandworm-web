import { Button, buttonClassName } from "@sandworm/ui/kit/button";
import { Card } from "@sandworm/ui/kit/card";
import { RequestStatusId, type RequestData } from "@sandworm/types/terminal";

import { AppLink } from "@/components/AppLink";
import { ReportLink } from "@/components/ReportLink";
import { site } from "@/config/site";
import {
  byLine,
  canApprove,
  noteOf,
  researchStatus,
  stepsOf,
} from "@/lib/requests/status";
import { webAppUrl } from "@/lib/web-app";
import type { Allowance } from "@/types";

import { StatusChip } from "./StatusChip";
import { Timeline } from "./Timeline";

type ResearchDetailProps = {
  request: RequestData;
  allowance: Allowance;
  onApprove: () => void;
};

export function ResearchDetail({
  request,
  allowance,
  onApprove,
}: ResearchDetailProps) {
  const titleId = `request-${request.id}-title`;
  const note = noteOf(request);

  return (
    <Card aria-labelledby={titleId} className="flex flex-col gap-[18px] p-6">
      <div className="flex flex-col gap-2">
        <StatusChip status={researchStatus(request)} />
        <h2
          id={titleId}
          className="text-lg font-medium leading-snug text-ink-100"
        >
          {request.question}
        </h2>
        <span className="text-xs text-ink-400">{byLine(request)}</span>
      </div>
      <Timeline label="Progress" steps={stepsOf(request)} />
      <div className="flex flex-col gap-2 rounded-[14px] bg-inputBg p-4 ring-1 ring-inset ring-border-secondary">
        <span className="flex items-center gap-2">
          <span className="font-medium text-ink-100">{site.name}</span>
          <span className="text-xs text-ink-400">{note.when}</span>
        </span>
        <p className="whitespace-pre-line text-sm leading-[1.55] text-ink-500">
          {note.text}
        </p>
      </div>
      {canApprove(request) && (
        <>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onApprove}>Approve scope</Button>
            <AppLink
              route="contact"
              className={buttonClassName({ variant: "secondary" })}
            >
              Suggest changes
            </AppLink>
          </div>
          <span className="text-xs text-ink-400">
            Approving uses 1 of your {allowance.total} studies this quarter.
          </span>
        </>
      )}
      {request.status === RequestStatusId.DELIVERED && (
        <ReportLink
          url={request.reportPath ? webAppUrl(request.reportPath) : undefined}
          className={buttonClassName({
            variant: "secondary",
            className: "self-start",
          })}
        >
          Read the report
        </ReportLink>
      )}
    </Card>
  );
}
