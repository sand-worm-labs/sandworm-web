"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@sandworm/ui/components/dialog";
import { Button, buttonClassName } from "@sandworm/ui/kit/button";
import { TextAreaField } from "@sandworm/ui/kit/form/text-area-field";
import { MODAL_CLASSNAME } from "@sandworm/ui/kit/modal";

import { CellOutputs } from "@/components/Briefing/CellOutputs";
import { ModalClose } from "@/components/ModalClose";
import { ReportLink } from "@/components/ReportLink";
import type { Signal, SignalStatus } from "@/types";

import { EvidenceMeter } from "./EvidenceMeter";
import { SignalStatusPicker } from "./SignalStatusPicker";

type SignalDetailDialogProps = {
  signal: Signal;
  onStatusChange: (status: SignalStatus) => void;
  onFeedbackSave: (feedback: string) => void;
  onClose: () => void;
};

export function SignalDetailDialog({
  signal,
  onStatusChange,
  onFeedbackSave,
  onClose,
}: SignalDetailDialogProps) {
  const saved = signal.feedback ?? "";
  const [feedback, setFeedback] = useState(saved);
  return (
    <Dialog open onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className={`${MODAL_CLASSNAME} sm:max-w-[680px]`}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-5">
          <div className="flex min-w-0 flex-col gap-1.5">
            <DialogTitle className="text-lg font-medium leading-snug text-ink-100">
              {signal.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-ink-500">
              {signal.observed}
            </DialogDescription>
          </div>
          <ModalClose />
        </div>
        <div className="flex flex-col gap-5 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-baseline gap-2">
              <span className="text-[22px] font-medium text-ink-100">
                {signal.size}
              </span>
              <span className="text-xs text-ink-400">{signal.sizeLabel}</span>
            </span>
            <EvidenceMeter evidence={signal.evidence} />
          </div>
          {signal.outputs && signal.outputs.length > 0 && (
            <CellOutputs outputs={signal.outputs} title={signal.title} />
          )}
          {signal.couldMean && (
            <div className="flex flex-col gap-1 rounded-[14px] bg-inputBg p-4 ring-1 ring-inset ring-border-secondary">
              <span className="text-xs font-medium text-ink-400">
                Could mean
              </span>
              <p className="text-sm leading-[1.55] text-ink-500">
                {signal.couldMean}
              </p>
            </div>
          )}
          <SignalStatusPicker value={signal.status} onChange={onStatusChange} />
          <div className="flex flex-col gap-2">
            <TextAreaField
              id="signal-feedback"
              label="Open feedback"
              rows={3}
              value={feedback}
              maxLength={2000}
              placeholder="How does this apply to you? What will you do with it, what is missing, or why is it not a fit."
              onChange={event => setFeedback(event.target.value)}
            />
            <Button
              variant="secondary"
              className="self-start"
              disabled={feedback.trim() === saved}
              onClick={() => onFeedbackSave(feedback.trim())}
            >
              Save feedback
            </Button>
          </div>
        </div>
        <div className="border-t border-border-secondary px-6 py-4">
          <ReportLink
            url={signal.reportUrl}
            className={buttonClassName({ variant: "secondary" })}
          >
            Open the notebook
          </ReportLink>
        </div>
      </DialogContent>
    </Dialog>
  );
}
