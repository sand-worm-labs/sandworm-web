"use client";

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import clsx from "clsx";
import { Fragment } from "react";
import { PiCheck } from "react-icons/pi";
import { toast } from "sonner";
import { escrowTokens } from "@sandworm/types/escrow";

import { CloseIconButton } from "@/components/CloseIconButton";
import { RichTextField } from "@/components/RichTextField";
import {
  segmentedTabClass,
  segmentedTabsClass,
} from "@/components/SegmentedTabs";
import { useCreateBountyMutation } from "@/generated/graphql";
import {
  EMPTY_BOUNTY_DRAFT,
  useBountyDraftStore,
  type BountyDraftForm,
} from "@/store/bountyDraft";
import { tintPillDarkClassName } from "@/styles/interactive";
import { escrowChains } from "@/web3/config";

import { REWARD_TOKENS } from "./bounties";
import { TokenLogo } from "./BountyLogos";

// =====================================
// ⬢ Constants
// =====================================
const STEPS = ["Basics", "Details", "Reward"];
const TYPES = ["Dashboard", "Research", "Investigation"];
const ESCROW_SYMBOLS = new Set(
  escrowChains.flatMap(chain =>
    (escrowTokens[chain.id] ?? []).map(token => token.symbol)
  )
);
const ESCROW_TOKENS = REWARD_TOKENS.filter(token =>
  ESCROW_SYMBOLS.has(token.symbol)
);
const AMOUNT_PATTERN = /^\d+(\.\d{1,6})?$/;

const labelClassName =
  "block text-sm font-medium text-ink-100 dark:text-gray-300 mb-2";
const inputClassName =
  "w-full px-4 py-3 rounded-xl bg-inputBg dark:bg-base-400 border border-border dark:border-border-tertiary text-ink-100 placeholder:text-ink-400 dark:placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-medium";
const secondaryButtonClassName =
  "py-2.5 px-5 rounded-xl text-sm font-medium text-ink-100 dark:text-white border border-border dark:border-border-tertiary hover:bg-hover-bg dark:hover:bg-base-600 transition-colors";
const primaryButtonClassName = `py-2.5 px-6 bg-primary hover:bg-primary-720 disabled:bg-disabled dark:disabled:bg-[#4a4a48] text-border-secondary font-medium rounded-xl transition-colors disabled:cursor-not-allowed text-sm border border-transparent ${tintPillDarkClassName}`;

const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

const isStepValid = (step: number, form: BountyDraftForm) => {
  if (step === 0) {
    return [form.title, form.sponsor, form.summary].every(v => v.trim());
  }
  if (step === 1) return form.details.trim().length > 0;
  return (
    AMOUNT_PATTERN.test(form.amount) &&
    Number(form.amount) > 0 &&
    form.deadline >= tomorrow()
  );
};

// =====================================
// ⬢ Stepper
// =====================================
const Stepper = ({ step }: { step: number }) => (
  <ol className="flex items-center gap-3">
    {STEPS.map((name, index) => (
      <li key={name} className="flex items-center gap-3">
        <span
          className={clsx(
            "flex items-center gap-2 text-xs font-medium",
            index <= step ? "text-ink-100 dark:text-white" : "text-ink-400"
          )}
        >
          <span
            className={clsx(
              "flex h-5 w-5 items-center justify-center rounded-full text-[11px]",
              index < step && "bg-primary text-white",
              index === step && "border-[1.5px] border-primary text-primary",
              index > step &&
                "border border-border dark:border-border-tertiary text-ink-400"
            )}
          >
            {index < step ? <PiCheck size={11} /> : index + 1}
          </span>
          {name}
        </span>
        {index < STEPS.length - 1 && (
          <span className="h-px w-8 bg-border-secondary dark:bg-border-tertiary" />
        )}
      </li>
    ))}
  </ol>
);

interface CreateBountyModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onCreated: (slug: string) => void;
}

// =====================================
// ⬢ Create Bounty Modal
// =====================================
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
            rewardAmount: form.amount,
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

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/[10.2%]" />
        </TransitionChild>

        <div className="fixed inset-0 font-body">
          <div className="flex h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="relative flex flex-col bg-white dark:bg-dropdown-bg dark:border dark:border-border-tertiary rounded-3xl w-full max-w-3xl h-[min(760px,90vh)] shadow-xl">
                <div className="shrink-0 px-10 pt-8 pb-6 border-b border-border-secondary dark:border-border-tertiary">
                  <div className="flex items-center justify-between">
                    <DialogTitle
                      as="h2"
                      className="text-base font-medium text-ink-100 dark:text-white"
                    >
                      Create bounty
                    </DialogTitle>
                    <CloseIconButton onClick={onClose} />
                  </div>
                  <div className="mt-5">
                    <Stepper step={step} />
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto px-10 py-6">
                  {step === 0 && (
                    <div className="space-y-5">
                      <div>
                        <label
                          htmlFor="bounty-title"
                          className={labelClassName}
                        >
                          Title
                        </label>
                        <input
                          id="bounty-title"
                          type="text"
                          value={form.title}
                          maxLength={120}
                          onChange={e => setForm({ title: e.target.value })}
                          placeholder="Create a Dashboard: Stablecoin Flows on Arbitrum"
                          className={inputClassName}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="bounty-sponsor"
                          className={labelClassName}
                        >
                          Sponsor
                        </label>
                        <input
                          id="bounty-sponsor"
                          type="text"
                          value={form.sponsor}
                          maxLength={80}
                          onChange={e => setForm({ sponsor: e.target.value })}
                          placeholder="Your protocol or team"
                          className={inputClassName}
                        />
                      </div>

                      <div>
                        <p className={labelClassName}>Type</p>
                        <div
                          className={`${segmentedTabsClass} w-fit`}
                          role="group"
                          aria-label="Bounty type"
                        >
                          {TYPES.map(option => (
                            <button
                              key={option}
                              type="button"
                              aria-pressed={form.type === option}
                              onClick={() => setForm({ type: option })}
                              className={segmentedTabClass(
                                form.type === option
                              )}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="bounty-summary"
                          className={labelClassName}
                        >
                          Summary
                        </label>
                        <textarea
                          id="bounty-summary"
                          rows={3}
                          value={form.summary}
                          maxLength={400}
                          onChange={e => setForm({ summary: e.target.value })}
                          placeholder="One or two sentences shown on the bounty card"
                          className={`${inputClassName} resize-none`}
                        />
                        <p className="mt-1.5 text-xs text-ink-400 text-right">
                          {form.summary.length}/400
                        </p>
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="flex h-full flex-col">
                      <p className="mb-3 text-xs text-ink-400">
                        What you want answered, what an entry must include and
                        how you will judge it. Markdown works too.
                      </p>
                      <RichTextField
                        value={form.details}
                        onChange={details => setForm({ details })}
                        placeholder="Background, what to answer, what to submit and how it will be judged"
                        className="flex-1 min-h-[320px]"
                      />
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="bounty-amount"
                            className={labelClassName}
                          >
                            Reward
                          </label>
                          <input
                            id="bounty-amount"
                            type="text"
                            inputMode="decimal"
                            value={form.amount}
                            onChange={e =>
                              setForm({ amount: e.target.value.trim() })
                            }
                            placeholder="500"
                            className={inputClassName}
                          />
                        </div>
                        <div>
                          <p className={labelClassName}>Token</p>
                          <div
                            className={`${segmentedTabsClass} w-fit`}
                            role="group"
                            aria-label="Reward token"
                          >
                            {ESCROW_TOKENS.map(option => (
                              <button
                                key={option.symbol}
                                type="button"
                                aria-pressed={token?.symbol === option.symbol}
                                onClick={() =>
                                  setForm({ token: option.symbol })
                                }
                                className={segmentedTabClass(
                                  token?.symbol === option.symbol
                                )}
                              >
                                <TokenLogo token={option} size={14} />
                                {option.symbol}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="sm:w-1/2 sm:pr-2.5">
                        <label
                          htmlFor="bounty-deadline"
                          className={labelClassName}
                        >
                          Deadline
                        </label>
                        <input
                          id="bounty-deadline"
                          type="date"
                          min={tomorrow()}
                          value={form.deadline}
                          onChange={e => setForm({ deadline: e.target.value })}
                          className={inputClassName}
                        />
                      </div>

                      <div className="rounded-2xl bg-base-600 p-5 text-sm">
                        <p className="font-medium text-ink-100 dark:text-white">
                          {form.title || "Untitled bounty"}
                        </p>
                        <p className="mt-1 text-xs text-ink-400">
                          {form.type} · Sponsored by {form.sponsor || "—"}
                        </p>
                        <p className="mt-3 flex items-center gap-1.5 font-semibold text-ink-100 dark:text-white">
                          {token && <TokenLogo token={token} size={16} />}
                          {form.amount || "0"} {token?.symbol}
                          <span className="font-normal text-ink-400">
                            {form.deadline && `· until ${form.deadline}`}
                          </span>
                        </p>
                        <p className="mt-3 text-xs leading-relaxed text-ink-400">
                          Saved as a draft that only you can see. It goes live
                          once you fund the reward in escrow on Arbitrum.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center justify-between gap-3 px-10 py-5 border-t border-border-secondary dark:border-border-tertiary">
                  <p className="text-xs text-ink-400">
                    Progress is kept in this browser.
                  </p>
                  <div className="flex items-center gap-3">
                    {step > 0 && (
                      <button
                        type="button"
                        onClick={() => setStep(step - 1)}
                        className={secondaryButtonClassName}
                      >
                        Back
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={!isStepValid(step, form) || loading}
                      onClick={
                        isLastStep ? handleSave : () => setStep(step + 1)
                      }
                      className={primaryButtonClassName}
                    >
                      {isLastStep
                        ? loading
                          ? "Saving..."
                          : "Save draft"
                        : "Continue"}
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
