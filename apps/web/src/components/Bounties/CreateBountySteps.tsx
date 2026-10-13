import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sandworm/ui/components/select";

import { RichTextField } from "@/components/RichTextField";
import {
  segmentedTabClass,
  segmentedTabsClass,
} from "@/components/SegmentedTabs";
import type { BountyDraftForm } from "@/store/bountyDraft";
import {
  modalInputClassName,
  modalLabelClassName,
  modalSelectContentClassName,
  modalSelectItemClassName,
  modalSelectTriggerClassName,
} from "@/web3/components/modalStyles";

import { ESCROW_TOKENS, TYPES, tomorrow } from "./createBountyForm";
import { TokenLogo } from "./BountyLogos";
import type { RewardToken } from "./tokens";

interface StepProps {
  form: BountyDraftForm;
  setForm: (patch: Partial<BountyDraftForm>) => void;
}

export const BasicsStep = ({ form, setForm }: StepProps) => (
  <div className="space-y-5">
    <div>
      <label htmlFor="bounty-title" className={modalLabelClassName}>
        Title
      </label>
      <input
        id="bounty-title"
        type="text"
        value={form.title}
        maxLength={120}
        onChange={e => setForm({ title: e.target.value })}
        placeholder="Create a Dashboard: Stablecoin Flows on Monad"
        className={modalInputClassName}
      />
    </div>

    <div>
      <label htmlFor="bounty-sponsor" className={modalLabelClassName}>
        Sponsor
      </label>
      <input
        id="bounty-sponsor"
        type="text"
        value={form.sponsor}
        maxLength={80}
        onChange={e => setForm({ sponsor: e.target.value })}
        placeholder="Your protocol or team"
        className={modalInputClassName}
      />
    </div>

    <div>
      <p className={modalLabelClassName}>Type</p>
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
            className={segmentedTabClass(form.type === option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>

    <div>
      <label htmlFor="bounty-summary" className={modalLabelClassName}>
        Summary
      </label>
      <textarea
        id="bounty-summary"
        rows={3}
        value={form.summary}
        maxLength={400}
        onChange={e => setForm({ summary: e.target.value })}
        placeholder="One or two sentences shown on the bounty card"
        className={`${modalInputClassName} resize-none`}
      />
      <p className="mt-1.5 text-xs text-ink-400 text-right">
        {form.summary.length}/400
      </p>
    </div>
  </div>
);

export const DetailsStep = ({ form, setForm }: StepProps) => (
  <div className="flex h-full flex-col">
    <p className="mb-3 text-xs text-ink-400">
      What you want answered, what an entry must include and how you will judge
      it. Markdown works too.
    </p>
    <RichTextField
      value={form.details}
      onChange={details => setForm({ details })}
      placeholder="Background, what to answer, what to submit and how it will be judged"
      className="flex-1 min-h-[320px]"
    />
  </div>
);

const TokenOption = ({ token }: { token: RewardToken }) => (
  <span className="flex items-center gap-2">
    <TokenLogo token={token} size={16} />
    {token.symbol}
  </span>
);

interface RewardStepProps extends StepProps {
  token: RewardToken | undefined;
}

export const RewardStep = ({ form, setForm, token }: RewardStepProps) => (
  <div className="space-y-6">
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor="bounty-amount" className={modalLabelClassName}>
          Reward
        </label>
        <input
          id="bounty-amount"
          type="text"
          inputMode="decimal"
          value={form.amount}
          onChange={e => setForm({ amount: e.target.value.trim() })}
          placeholder="500"
          className={modalInputClassName}
        />
      </div>

      <div>
        <p className={modalLabelClassName}>Token</p>
        <Select
          value={token?.symbol}
          onValueChange={value => setForm({ token: value })}
        >
          <SelectTrigger
            aria-label="Reward token"
            className={modalSelectTriggerClassName}
          >
            <SelectValue placeholder="Select token">
              {token && <TokenOption token={token} />}
            </SelectValue>
          </SelectTrigger>
          <SelectContent
            className={modalSelectContentClassName}
            side="bottom"
            sideOffset={4}
            avoidCollisions={false}
          >
            {ESCROW_TOKENS.map(option => (
              <SelectItem
                key={option.symbol}
                value={option.symbol}
                className={modalSelectItemClassName}
              >
                <TokenOption token={option} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="sm:w-1/2 sm:pr-2.5">
      <label htmlFor="bounty-deadline" className={modalLabelClassName}>
        Deadline
      </label>
      <input
        id="bounty-deadline"
        type="date"
        min={tomorrow()}
        value={form.deadline}
        onChange={e => setForm({ deadline: e.target.value })}
        className={modalInputClassName}
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
        Saved as a draft that only you can see. It goes live once you fund the
        reward in escrow on Monad.
      </p>
    </div>
  </div>
);
