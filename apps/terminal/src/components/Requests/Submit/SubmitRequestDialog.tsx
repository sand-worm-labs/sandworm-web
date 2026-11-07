"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@sandworm/ui/components/dialog";
import { MODAL_CLASSNAME } from "@sandworm/ui/kit/modal";

import { ROUTES } from "@/config/routes";
import { site } from "@/config/site";
import { isResearchUsedUp } from "@/features/requests/requests-state";
import type { Allowance } from "@/features/requests/types";
import { submitRequest } from "@/features/requests/submit/actions";
import {
  emptyDraft,
  formatSubmittedAt,
} from "@/features/requests/submit/draft";
import type { RequestDraft } from "@/features/requests/submit/types";

import { AllowanceUsed } from "./AllowanceUsed";
import { RequestForm } from "./RequestForm";
import { RequestSent } from "./RequestSent";
import { RequestDialogHeader } from "./RequestDialogHeader";

type SubmitRequestDialogProps = {
  allowance: Allowance;
  clientName: string;
};

type Phase = { _tag: "editing" } | { _tag: "sent"; submittedAt: string };

export function SubmitRequestDialog({
  allowance,
  clientName,
}: SubmitRequestDialogProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<RequestDraft>(emptyDraft);
  const [phase, setPhase] = useState<Phase>({ _tag: "editing" });
  const [isSending, setIsSending] = useState(false);

  const send = async () => {
    setIsSending(true);
    try {
      await submitRequest(draft);
      setPhase({ _tag: "sent", submittedAt: formatSubmittedAt(new Date()) });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={isOpen => {
        if (!isOpen) router.push(ROUTES.requests.path);
      }}
    >
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className={`${MODAL_CLASSNAME} sm:max-w-[640px]`}
      >
        <DialogTitle className="sr-only">Submit a request</DialogTitle>
        <DialogDescription className="sr-only">
          Ask {site.name} for a piece of research.
        </DialogDescription>
        <RequestDialogHeader />
        {isResearchUsedUp(allowance) ? (
          <AllowanceUsed allowance={allowance} />
        ) : phase._tag === "sent" ? (
          <RequestSent draft={draft} submittedAt={phase.submittedAt} />
        ) : (
          <RequestForm
            draft={draft}
            onChange={setDraft}
            onSubmit={send}
            isSending={isSending}
            allowance={allowance}
            clientName={clientName}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
