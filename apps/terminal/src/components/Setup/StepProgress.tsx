import Link from "next/link";

type StepProgressProps<Id extends string> = {
  label: string;
  steps: readonly { id: Id; label: string }[];
  currentId: Id;
  pathFor: (id: Id) => string;
};

export function StepProgress<Id extends string>({
  label,
  steps,
  currentId,
  pathFor,
}: StepProgressProps<Id>) {
  const currentIndex = steps.findIndex(step => step.id === currentId);

  return (
    <div className="flex flex-col gap-1">
      <span className="px-1 text-sm text-ink-200">
        Step {currentIndex + 1} of {steps.length}
      </span>
      <ol aria-label={label} className="flex list-none gap-4 p-0 sm:gap-12">
        {steps.map((step, index) => {
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
                <Link href={pathFor(step.id)} className="block">
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
