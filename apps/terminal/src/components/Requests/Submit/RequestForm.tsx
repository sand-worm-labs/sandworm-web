"use client";

import { Button, buttonClassName } from "@sandworm/ui/kit/button";
import { ChipInput } from "@sandworm/ui/kit/form/chip-input";
import { FilePicker } from "@sandworm/ui/kit/form/file-picker";
import { NativeSelect } from "@sandworm/ui/kit/form/native-select";
import { TextAreaField } from "@sandworm/ui/kit/form/text-area-field";
import { ToggleChip } from "@sandworm/ui/kit/form/toggle-chip";
import { labelClassName } from "@sandworm/ui/kit/form/styles";

import { AppLink } from "@/components/AppLink";
import { site } from "@/config/site";
import type { Allowance, RequestDraft } from "@/types";
import { canSubmit } from "@/lib/requests/submit/draft";
import { TIMINGS, USE_CASES } from "@/data/requests/submit-options";

import { AllowancePips } from "./AllowancePips";

type RequestFormProps = {
  draft: RequestDraft;
  onChange: (draft: RequestDraft) => void;
  onSubmit: () => void;
  isSending: boolean;
  allowance: Allowance;
  clientName: string;
};

export function RequestForm({
  draft,
  onChange,
  onSubmit,
  isSending,
  allowance,
  clientName,
}: RequestFormProps) {
  const update = (patch: Partial<RequestDraft>) =>
    onChange({ ...draft, ...patch });

  return (
    <form
      className="flex flex-col"
      onSubmit={event => {
        event.preventDefault();
        if (canSubmit(draft) && !isSending) onSubmit();
      }}
    >
      <div className="flex flex-col gap-1.5 px-6 pb-1 pt-[18px]">
        <h2 className="text-xl font-medium text-ink-100">Submit a request</h2>
        <p className="text-sm text-ink-500">
          Tell {site.name} what you want to know. You&apos;ll get a scope to
          approve before work starts.
        </p>
      </div>
      <div className="mx-6 mt-3">
        <AllowancePips
          used={allowance.research.used}
          total={allowance.research.total}
          note={`Resets ${allowance.resetsShort}. This counts only once you approve the scope.`}
        />
      </div>
      <div className="flex flex-col gap-[18px] px-6 py-[18px]">
        <div className="flex flex-col gap-1.5">
          <TextAreaField
            id="request-question"
            label="What do you want to know?"
            rows={4}
            value={draft.question}
            placeholder={`For example: how many of ${clientName}'s users cash out to Brazilian reais, and what they pay.`}
            onChange={event => update({ question: event.target.value })}
          />
          <span className="text-xs text-ink-400">
            One question is best. {site.name} will suggest how to split bigger
            ones.
          </span>
        </div>
        <fieldset className="flex min-w-0 flex-col gap-2">
          <legend className={`${labelClassName} mb-2`}>
            What will you use it for?
          </legend>
          <div className="flex flex-wrap gap-2">
            {USE_CASES.map(useCase => (
              <ToggleChip
                key={useCase.id}
                pressed={draft.useCase === useCase.id}
                onToggle={() => update({ useCase: useCase.id })}
              >
                {useCase.label}
              </ToggleChip>
            ))}
          </div>
        </fieldset>
        <ChipInput
          label="About (optional)"
          values={draft.about}
          onChange={about => update({ about })}
          hint="Add a project, region or sector."
        />
        <div className="flex flex-wrap gap-4">
          <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
            <span className={labelClassName}>When do you need it?</span>
            <NativeSelect
              label="When do you need it?"
              value={draft.timing}
              options={TIMINGS}
              onChange={timing => update({ timing })}
              className="w-full"
            />
          </div>
          <div className="min-w-[220px] flex-1">
            <FilePicker
              label="Files (optional)"
              files={draft.files}
              onChange={files => update({ files })}
              hint={`Files you add stay private to ${clientName}.`}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border-secondary px-6 py-3.5">
        <div className="flex gap-2">
          <AppLink
            route="requests"
            className={buttonClassName({ variant: "secondary" })}
          >
            Cancel
          </AppLink>
          <Button type="submit" disabled={!canSubmit(draft) || isSending}>
            Send to {site.name}
          </Button>
        </div>
      </div>
    </form>
  );
}
