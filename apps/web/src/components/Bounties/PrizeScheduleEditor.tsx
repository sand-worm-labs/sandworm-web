"use client";

import { PiPlus, PiTrash } from "react-icons/pi";

import { AmountInput } from "./AmountInput";
import { MAX_PRIZE_PLACES, prizeProblems } from "./createBountyForm";
import { ordinalPlace } from "./bounties";

interface PrizeScheduleEditorProps {
  prizes: string[];
  onChange: (prizes: string[]) => void;
  unit: string;
  unitIcon?: React.ReactNode;
}

// =====================================
// ⬢ Prize Schedule Editor
// =====================================
// The amount each place's winner receives, 1st place first. It is fixed once the bounty is
// funded: the award screen pays only these amounts, to entries.
export const PrizeScheduleEditor = ({
  prizes,
  onChange,
  unit,
  unitIcon,
}: PrizeScheduleEditorProps) => {
  const problems = prizeProblems(prizes);
  const setPrize = (index: number, value: string) =>
    onChange(prizes.map((prize, i) => (i === index ? value : prize)));

  return (
    <fieldset>
      <legend className="block text-sm font-medium text-ink-100 dark:text-gray-300">
        Prizes
      </legend>
      <p className="mt-1 text-xs leading-relaxed text-ink-400 dark:text-white/70">
        What each place&apos;s winner receives. The schedule is fixed once the
        bounty is funded: the award screen pays only these amounts, to entries,
        and any payment that departs from them is flagged on the bounty.
      </p>

      <ul className="mt-3 space-y-2.5">
        {prizes.map((prize, index) => (
          // The list has no reordering: a place is its position.
          // eslint-disable-next-line react/no-array-index-key
          <li key={index}>
            <div className="flex items-center gap-3">
              <span className="w-[4.5rem] shrink-0 text-sm font-medium text-ink-100 dark:text-white">
                {ordinalPlace(index + 1)}
              </span>
              <div className="min-w-0 flex-1">
                <AmountInput
                  label={`${ordinalPlace(index + 1)} place prize`}
                  value={prize}
                  onChange={value => setPrize(index, value)}
                  unit={unit}
                  unitIcon={unitIcon}
                  placeholder={index === 0 ? "500" : "0"}
                  invalid={problems[index] !== undefined}
                />
              </div>
              <button
                type="button"
                aria-label={`Remove ${ordinalPlace(index + 1)} place`}
                disabled={prizes.length === 1}
                onClick={() => onChange(prizes.filter((_, i) => i !== index))}
                className="shrink-0 rounded-lg p-2 text-ink-400 transition-colors hover:text-ink-100 disabled:opacity-30 dark:text-white/60 dark:hover:text-white"
              >
                <PiTrash size={16} />
              </button>
            </div>
            {problems[index] && (
              <p className="mt-1 pl-[5.5rem] text-xs text-red-600 dark:text-red-400">
                {problems[index]}
              </p>
            )}
          </li>
        ))}
      </ul>

      {problems.all && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
          {problems.all}
        </p>
      )}

      <button
        type="button"
        disabled={prizes.length >= MAX_PRIZE_PLACES}
        onClick={() => onChange([...prizes, ""])}
        className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline disabled:opacity-40"
      >
        <PiPlus size={12} /> Add a place
      </button>
    </fieldset>
  );
};
