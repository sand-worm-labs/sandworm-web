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

import { isResearchUsedUp } from "../requests-state";
import type { Allowance } from "../types";

import { submitRequest } from "./actions";
import { AllowanceUsed } from "./components/AllowanceUsed";
import { RequestForm } from "./components/RequestForm";
import { RequestSent } from "./components/RequestSent";
import { RequestDialogHeader } from "./components/RequestDialogHeader";
import { emptyDraft, formatSubmittedAt } from "./draft";
import type { RequestDraft } from "./types";

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
