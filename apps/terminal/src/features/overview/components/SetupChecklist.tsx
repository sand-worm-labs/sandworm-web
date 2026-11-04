import clsx from "clsx";
import { PiCheck } from "react-icons/pi";

import { AppLink } from "@/components/AppLink";
import { buttonClassName } from "@/components/Button";

import type { SetupStep } from "../types";

import { LIST_ROW_DIVIDER_CLASSNAME } from "./list-row";

function StepIcon({ isDone }: { isDone: boolean }) {
  if (!isDone) {
    return (
      <span
        role="img"
        aria-label="To do"
        className="mt-px size-5 shrink-0 rounded-full border-[1.5px] border-dashed border-ink-600"
      />
    );
  }

  return (
    <span
      role="img"
      aria-label="Done"
      className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white"
    >
      <PiCheck size={12} aria-hidden="true" />
    </span>
  );
}

export function SetupChecklist({ steps }: { steps: readonly SetupStep[] }) {
  return (
    <ol className="flex list-none flex-col p-0">
      {steps.map(step => (
        <li
          key={step.id}
          className={clsx(
            "grid grid-cols-[20px_minmax(0,1fr)_auto] items-start gap-3 py-3",
            LIST_ROW_DIVIDER_CLASSNAME
          )}
        >
          <StepIcon isDone={step.isDone} />
          <span className="flex min-w-0 flex-col gap-px">
            <span
              className={clsx(
                "text-sm font-medium",
                step.isDone ? "text-ink-400 line-through" : "text-ink-100"
              )}
            >
              {step.title}
            </span>
            <span className="text-[13px] text-ink-400">{step.detail}</span>
          </span>
          {step.action && (
            <AppLink
              route={step.action.route}
              className={buttonClassName({ variant: "secondary", size: "sm" })}
            >
              {step.action.label}
            </AppLink>
          )}
        </li>
      ))}
    </ol>
  );
}
