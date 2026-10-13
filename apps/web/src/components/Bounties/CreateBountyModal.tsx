"use client";

import { toast } from "sonner";

import {
  EMPTY_BOUNTY_DRAFT,
  useBountyDraftStore,
  type BountyDraftForm,
} from "@/store/bountyDraft";
import { useCreateBountyMutation } from "@/generated/graphql";
import { ModalShell } from "@/web3/components/ModalShell";
import {
  modalInlinePrimaryButtonClassName,
  modalSecondaryButtonClassName,
} from "@/web3/components/modalStyles";

import { CreateBountyStepper } from "./CreateBountyStepper";
import { BasicsStep, DetailsStep, RewardStep } from "./CreateBountySteps";
import { ESCROW_TOKENS, STEPS, isStepValid } from "./createBountyForm";

interface CreateBountyModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onCreated: (slug: string) => void;
}

export default function CreateBountyModal({
  isOpen,
  onClose,
  workspaceId,
  onCreated,
}: CreateBountyModalProps) {
  const draft = useBountyDraftStore(
    state => state.drafts[workspaceId] ?? EMPTY_BOUNTY_DRAFT
  );
  const update = useBountyDraftStore(state => state.update);
  const clear = useBountyDraftStore(state => state.clear);
  const [createBounty, { loading }] = useCreateBountyMutation();

  const { step, form } = draft;
  const setForm = (patch: Partial<BountyDraftForm>) =>
    update(workspaceId, { form: { ...form, ...patch } });
  const setStep = (next: number) => update(workspaceId, { step: next });
  const isLastStep = step === STEPS.length - 1;
  const token =
    ESCROW_TOKENS.find(t => t.symbol === form.token) ?? ESCROW_TOKENS[0];

  const handleSave = async () => {
    try {
      const { data } = await createBounty({
        variables: {
          input: {
            workspaceId,
            title: form.title.trim(),
            sponsor: form.sponsor.trim(),
            type: form.type,
            summary: form.summary.trim(),
            details: form.details.trim(),
            rewardToken: token?.symbol ?? form.token,
            prizes: form.prizes.map(prize => prize.trim()),
            deadline: new Date(`${form.deadline}T23:59:59`).toISOString(),
          },
        },
      });
      if (!data?.createBounty) throw new Error("No bounty returned");
      toast.success("Bounty saved as a draft.");
      clear(workspaceId);
      onCreated(data.createBounty.slug);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Could not save the bounty. Please try again.");
    }
  };

  const primaryLabel = isLastStep
    ? loading
      ? "Saving..."
      : "Save draft"
    : "Continue";

  return (
    <ModalShell
      wide
      isOpen={isOpen}
      onClose={onClose}
      title="Create bounty"
      headerExtra={<CreateBountyStepper step={step} />}
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-ink-400">
            Progress is kept in this browser.
          </p>
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className={modalSecondaryButtonClassName}
              >
                Back
              </button>
            )}
            <button
              type="button"
              disabled={!isStepValid(step, form) || loading}
              onClick={isLastStep ? handleSave : () => setStep(step + 1)}
              className={modalInlinePrimaryButtonClassName}
            >
              {primaryLabel}
            </button>
          </div>
        </div>
      }
    >
      {step === 0 && <BasicsStep form={form} setForm={setForm} />}
      {step === 1 && <DetailsStep form={form} setForm={setForm} />}
      {step === 2 && <RewardStep form={form} setForm={setForm} token={token} />}
    </ModalShell>
  );
}
