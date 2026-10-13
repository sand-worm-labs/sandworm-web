import clsx from "clsx";
import { PiCheck } from "react-icons/pi";

import { STEPS } from "./createBountyForm";

export const CreateBountyStepper = ({ step }: { step: number }) => (
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
