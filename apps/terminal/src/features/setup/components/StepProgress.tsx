import Link from "next/link";

import { SETUP_STEPS } from "../steps";
import { setupStepPath, type SetupStepId } from "../steps/routes";

export function StepProgress({
  currentStepId,
}: {
  currentStepId: SetupStepId;
}) {
  const currentIndex = SETUP_STEPS.findIndex(step => step.id === currentStepId);

  return (
    <div className="flex flex-col gap-1">
      <span className="px-1 text-sm text-ink-200">
        Step {currentIndex + 1} of {SETUP_STEPS.length}
      </span>
      <ol
        aria-label="Setup steps"
        className="flex list-none gap-4 p-0 sm:gap-12"
      >
        {SETUP_STEPS.map((step, index) => {
          const isActive = index === currentIndex;
          const content = (
            <>
              <span
                className={`mb-2 mt-2 block h-[2.5px] w-full rounded-full sm:w-40 ${
                  isActive ? "bg-rainbow-gradient" : "bg-border-secondary"
                }`}
              />
              <span
                className={`flex items-center gap-2 px-1 text-sm ${
                  isActive ? "text-ink-200" : "text-ink-300"
                }`}
              >
                <span>{index + 1}.</span>
                <span>{step.label}</span>
              </span>
            </>
          );

          return (
            <li
              key={step.id}
              aria-current={isActive ? "step" : undefined}
              className="min-w-0 flex-1 sm:flex-none"
            >
              {index < currentIndex ? (
                <Link href={setupStepPath(step.id)} className="block">
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
