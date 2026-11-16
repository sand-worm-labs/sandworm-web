import { PiPlus } from "react-icons/pi";
import type { AnalysisReport } from "@sandworm/types/terminal";
import { buttonClassName } from "@sandworm/ui/kit/button";
import { Card } from "@sandworm/ui/kit/card";
import { ROW_HOVER_CLASSNAME } from "@sandworm/ui/kit/interactive";
import { Pill } from "@sandworm/ui/kit/pill";

import { AppLink } from "@/components/AppLink";
import { ReportLink } from "@/components/ReportLink";
import { shortDay } from "@/lib/dates";
import { webAppUrl } from "@/lib/web-app";

// A collection of analysis: each report is a notebook, with a line about it
export function ReportList({
  reports,
}: {
  reports: readonly AnalysisReport[];
}) {
  return (
    <Card aria-labelledby="reports-title" className="px-2 pb-2.5 pt-[22px]">
      <div className="flex items-center justify-between gap-4 px-3 pb-2">
        <h2 id="reports-title" className="text-base font-medium text-ink-100">
          Analysis
        </h2>
        <AppLink
          route="newRequest"
          className={buttonClassName({ className: "gap-2" })}
        >
          <PiPlus size={14} />
          Request a notebook
        </AppLink>
      </div>
      {reports.map((report, index) => (
        <div
          key={report.id}
          className={index > 0 ? "border-t border-border-secondary" : undefined}
        >
          <ReportLink
            url={report.path ? webAppUrl(report.path) : undefined}
            className={`${ROW_HOVER_CLASSNAME} grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-3 py-3.5`}
          >
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="flex items-center gap-2">
                <span className="text-sm font-medium text-ink-100">
                  {report.title}
                </span>
                {report.isNew && <Pill>New</Pill>}
              </span>
              {report.line && (
                <span className="text-[13px] text-ink-400">{report.line}</span>
              )}
            </span>
            <span className="whitespace-nowrap text-xs text-ink-400">
              {shortDay(report.publishedAt)}
            </span>
          </ReportLink>
        </div>
      ))}
    </Card>
  );
}
