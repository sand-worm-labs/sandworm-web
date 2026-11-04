"use client";

import { useState } from "react";

import { AppLink } from "@/components/AppLink";
import { buttonClassName } from "@/components/Button";
import { SectionHeader } from "@/features/sections/SectionHeader";
import type { SectionCounts } from "@/features/sections/types";

import { AllowanceSummary } from "./components/AllowanceSummary";
import { QuestionsList } from "./components/QuestionsList";
import { ResearchDetail } from "./components/ResearchDetail";
import { ResearchList } from "./components/ResearchList";
import {
  approveScope,
  pickDefaultRequest,
  withApprovedResearch,
} from "./requests-state";
import type { RequestsData, ResearchRequest } from "./types";

type RequestsScreenProps = {
  data: RequestsData;
  counts: SectionCounts;
};

export function RequestsScreen({ data, counts }: RequestsScreenProps) {
  const [requests, setRequests] = useState<readonly ResearchRequest[]>(
    data.research
  );
  const [approvedCount, setApprovedCount] = useState(0);
  const [selectedId, setSelectedId] = useState(
    () => pickDefaultRequest(data.research)?.id
  );

  const selected =
    requests.find(request => request.id === selectedId) ?? requests[0];
  const allowance = withApprovedResearch(data.allowance, approvedCount);

  const approveSelected = () => {
    if (!selected) return;
    setRequests(
      requests.map(r => (r.id === selected.id ? approveScope(r) : r))
    );
    setApprovedCount(count => count + 1);
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        current="requests"
        title="Requests"
        subtitle="Research you've commissioned and questions you've asked."
        counts={counts}
        actions={
          <AppLink route="commission" className={buttonClassName()}>
            Commission research
          </AppLink>
        }
      />
      <AllowanceSummary allowance={allowance} />
      {selected && (
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <ResearchList
            requests={requests}
            selectedId={selected.id}
            onSelect={setSelectedId}
          />
          <ResearchDetail
            request={selected}
            allowance={allowance}
            onApprove={approveSelected}
          />
        </div>
      )}
      <QuestionsList questions={data.questions} />
    </div>
  );
}
