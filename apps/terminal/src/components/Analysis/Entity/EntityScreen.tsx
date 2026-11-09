"use client";

import { PiCaretLeft } from "react-icons/pi";
import { BarLoader } from "@sandworm/ui/kit/bar-loader";

import { AppLink } from "@/components/AppLink";
import { useEntityPage } from "@/hooks/useEntityPage";

import { EntityHeader } from "./EntityHeader";
import { ReportList } from "./ReportList";

export function EntityScreen({ id }: { id: string }) {
  const { data, error } = useEntityPage(id);
  if (error) {
    return (
      <p className="text-sm text-ink-400">
        Could not load this page. Please try again.
      </p>
    );
  }
  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <BarLoader />
      </div>
    );
  }
  const { subject } = data;
  if (!subject) {
    return <p className="text-sm text-ink-400">This page does not exist.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <AppLink
        route="analysis"
        className="inline-flex items-center gap-1 self-start text-[13px] text-ink-400 transition-colors hover:text-ink-100"
      >
        <PiCaretLeft size={12} aria-hidden="true" />
        Analysis
      </AppLink>
      <EntityHeader
        kind={subject.view}
        name={subject.name}
        icon={subject.icon}
        description={subject.kind}
      />
      <ReportList reports={subject.reports} />
    </div>
  );
}
