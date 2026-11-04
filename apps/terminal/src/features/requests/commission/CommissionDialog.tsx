"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@sandworm/ui/components/dialog";

import { ROUTES } from "@/config/routes";
import { site } from "@/config/site";

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
  clientName: string;
};

type Phase = { _tag: "editing" } | { _tag: "sent"; submittedAt: string };

export function CommissionDialog({
  allowance,
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
        className="top-14 max-h-[calc(100vh-7rem)] outline-none translate-y-0 gap-0 overflow-auto rounded-[22px] border border-hover-border bg-block-surface p-0 font-body text-[13px] leading-[1.45] text-ink-100 sm:max-w-[640px]"
      >
        <DialogTitle className="sr-only">Commission research</DialogTitle>
        <DialogDescription className="sr-only">
          Ask {site.name} for a piece of research.
        </DialogDescription>
        <CommissionTabs />
        {isResearchUsedUp(allowance) ? (
          <AllowanceUsed allowance={allowance} />
        ) : phase._tag === "sent" ? (
          <CommissionSent draft={draft} submittedAt={phase.submittedAt} />
        ) : (
          <CommissionForm
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
