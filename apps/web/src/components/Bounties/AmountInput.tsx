"use client";

import { cleanAmount } from "./createBountyForm";

interface AmountInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  // The unit shown inside the field, such as the token's symbol
  unit: string;
  unitIcon?: React.ReactNode;
  label: string;
  placeholder?: string;
  invalid?: boolean;
}

// =====================================
// ⬢ Amount Input
// =====================================
// An amount of money: digits and one decimal point only, the unit sitting inside the field, and
// numerals that line up. It takes pasted text and cleans it, so "1,000 USDT" becomes 1000.
export const AmountInput = ({
  id,
  value,
  onChange,
  unit,
  unitIcon,
  label,
  placeholder = "0",
  invalid = false,
}: AmountInputProps) => (
  <div
    className={`flex items-center rounded-xl border bg-inputBg transition-colors focus-within:ring-2 focus-within:ring-primary dark:bg-dropdown-bg ${
      invalid
        ? "border-red-500 dark:border-red-500"
        : "border-border dark:border-border-tertiary"
    }`}
  >
    <input
      id={id}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      spellCheck={false}
      aria-label={label}
      aria-invalid={invalid || undefined}
      value={value}
      placeholder={placeholder}
      onChange={event => onChange(cleanAmount(event.target.value))}
      className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm font-medium tabular-nums text-ink-100 outline-none placeholder:text-ink-400 dark:text-white"
    />
    <span className="flex shrink-0 items-center gap-1.5 pr-3 text-xs font-medium text-ink-400 dark:text-white/70">
      {unitIcon}
      {unit}
    </span>
  </div>
);
