"use client";

import clsx from "clsx";
import { forwardRef } from "react";

interface StyledCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  "aria-label": string;
}

export const StyledCheckbox = forwardRef<HTMLInputElement, StyledCheckboxProps>(
  ({ checked, indeterminate, onChange, ...rest }, ref) => {
    const active = checked || indeterminate;
    return (
      <label className="relative inline-flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer absolute inset-0 h-4 w-4 cursor-pointer opacity-0"
          {...rest}
        />
        <span
          aria-hidden="true"
          className={clsx(
            "flex h-4 w-4 items-center justify-center rounded-[4px] border bg-base-100 transition-colors",
            "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#7F56D9]",
            active
              ? "border-[#7F56D9]"
              : "border-[#D0D5DD] dark:border-border-tertiary"
          )}
        >
          {indeterminate ? (
            <span className="h-[2px] w-2 rounded-full bg-[#7F56D9]" />
          ) : checked ? (
            <svg viewBox="0 0 12 12" fill="none" className="h-3.5 w-3.5">
              <path
                d="M2.5 6.2L4.8 8.5L9.5 3.5"
                stroke="#7F56D9"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>
      </label>
    );
  }
);
StyledCheckbox.displayName = "StyledCheckbox";
