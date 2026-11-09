"use client";

import { useState } from "react";
import {
  RequestKindId,
  type RequestData,
  type TerminalRequests,
} from "@sandworm/types/terminal";
import { BarLoader } from "@sandworm/ui/kit/bar-loader";
import { buttonClassName } from "@sandworm/ui/kit/button";

import { AppLink } from "@/components/AppLink";
import { SectionHeader } from "@/components/Sections/SectionHeader";
import { useApproveTerminalRequestScopeMutation } from "@/generated/graphql";
import { useRequests } from "@/hooks/useRequests";
import { usePreview } from "@/providers/PreviewProvider";
import type { SectionCounts } from "@/types";
import { AllowanceSummary } from "@/components/Requests/AllowanceSummary";
import { QuestionsList } from "@/components/Requests/QuestionsList";
import { ResearchDetail } from "@/components/Requests/ResearchDetail";
import { ResearchList } from "@/components/Requests/ResearchList";
import {
  approveScope,
  pickDefaultRequest,
  withApprovedResearch,
} from "@/lib/requests/requests-state";

type RequestsScreenProps = { counts: SectionCounts };

export function RequestsScreen(props: RequestsScreenProps) {
  const { data, error } = useRequests();
  if (error) {
    return (
      <p className="text-sm text-ink-400">
        Could not load your requests. Please try again.
      </p>
    );
  }
  return data ? (
    <RequestsInbox data={data} {...props} />
  ) : (
    <div className="flex min-h-[60vh] items-center justify-center">
      <BarLoader />
    </div>
  );
}

function RequestsInbox({
  data,
  counts,
}: RequestsScreenProps & { data: TerminalRequests }) {
  const { isForced } = usePreview();
  const [approve] = useApproveTerminalRequestScopeMutation();
  const research = data.requests.filter(
    request => request.kind === RequestKindId.RESEARCH
  );
  const [requests, setRequests] = useState<readonly RequestData[]>(research);
  const [approvedCount, setApprovedCount] = useState(0);
  const [selectedId, setSelectedId] = useState(
    () => pickDefaultRequest(research)?.id
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
    if (!isForced) approve({ variables: { requestId: selected.id } });
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        current="requests"
        title="Requests"
        subtitle="Research and questions you've submitted."
        counts={counts}
        actions={
          <AppLink route="newRequest" className={buttonClassName()}>
            Submit a request
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
      <QuestionsList
        questions={data.requests.filter(
          request => request.kind === RequestKindId.QUESTION
        )}
      />
    </div>
  );
}
