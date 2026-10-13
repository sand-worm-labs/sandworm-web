import type { IconType } from "react-icons";
import { PiListThin, PiSquareSplitVerticalFill } from "react-icons/pi";

import { cn } from "@/lib/utils";
import { iconButtonMdClassName } from "@/styles/interactive";

export interface ViewOption<T extends string> {
  value: T;
  label: string;
  icon: IconType;
}

export const GRID_VIEW: ViewOption<"grid"> = {
  value: "grid",
  label: "Grid view",
  icon: PiSquareSplitVerticalFill,
};

export const LIST_VIEW: ViewOption<"list"> = {
  value: "list",
  label: "List view",
  icon: PiListThin,
};

interface ViewToggleProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ViewOption<T>[];
}

export const ViewToggle = <T extends string>({
  value,
  onChange,
  options,
}: ViewToggleProps<T>) => (
  <div className="flex items-center gap-2" role="group" aria-label="View mode">
    {options.map(({ value: option, label, icon: Icon }) => (
      <button
        key={option}
        type="button"
        title={label}
        aria-label={label}
        aria-pressed={value === option}
        onClick={() => onChange(option)}
        className={cn(
          iconButtonMdClassName,
          "border border-transparent rounded-[10px] hover:bg-hover-bg hover:border-hover-border dark:hover:bg-base-600",
          value === option &&
            "text-primary hover:text-primary dark:text-white dark:hover:text-white dark:bg-base-400 dark:border-border-tertiary"
        )}
      >
        <Icon className="text-xl" />
      </button>
    ))}
  </div>
);
