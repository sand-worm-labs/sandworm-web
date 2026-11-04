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

import { isResearchUsedUp } from "../requests-state";
import type { Allowance } from "../types";

import { submitCommission } from "./actions";
import { AllowanceUsed } from "./components/AllowanceUsed";
import { CommissionForm } from "./components/CommissionForm";
import { CommissionSent } from "./components/CommissionSent";
import { CommissionTabs } from "./components/CommissionTabs";
import { emptyDraft, formatSubmittedAt } from "./draft";
import type { CommissionDraft } from "./types";

type CommissionDialogProps = {
  allowance: Allowance;
  analystName: string;
  clientName: string;
};

type Phase = { _tag: "editing" } | { _tag: "sent"; submittedAt: string };

export function CommissionDialog({
  allowance,
  analystName,
  clientName,
}: CommissionDialogProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<CommissionDraft>(emptyDraft);
  const [phase, setPhase] = useState<Phase>({ _tag: "editing" });
  const [isSending, setIsSending] = useState(false);

  const send = async () => {
    setIsSending(true);
    try {
      await submitCommission(draft);
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
        <DialogTitle className="sr-only">Commission research</DialogTitle>
        <DialogDescription className="sr-only">
          Ask {analystName} for a piece of research.
        </DialogDescription>
        <CommissionTabs />
        {isResearchUsedUp(allowance) ? (
          <AllowanceUsed allowance={allowance} analystName={analystName} />
        ) : phase._tag === "sent" ? (
          <CommissionSent
            draft={draft}
            submittedAt={phase.submittedAt}
            analystName={analystName}
          />
        ) : (
          <CommissionForm
            draft={draft}
            onChange={setDraft}
            onSubmit={send}
            isSending={isSending}
            allowance={allowance}
            analystName={analystName}
            clientName={clientName}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
