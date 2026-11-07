import { PiMagnifyingGlass } from "react-icons/pi";
import { Button, buttonClassName } from "@sandworm/ui/kit/button";

import { AppLink } from "@/components/AppLink";
import { site } from "@/config/site";

type AnalysisNoResultsProps = {
  query: string;
  suggestion?: string;
  onClear: () => void;
};

export function AnalysisNoResults({
  query,
  suggestion,
  onClear,
}: AnalysisNoResultsProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 pb-[72px] pt-16 text-center">
      <span
        aria-hidden="true"
        className="flex size-[52px] items-center justify-center rounded-full bg-primary-tint-75 text-primary-700 dark:bg-primary-910 dark:text-primary-200"
      >
        <PiMagnifyingGlass size={24} />
      </span>
      <h2 className="text-lg font-medium text-ink-100">
        No analysis matches &ldquo;{query}&rdquo;
      </h2>
      <p className="max-w-[440px] text-sm leading-[1.55] text-ink-500">
        We haven&apos;t researched this yet. {site.name} can scope it for you.
        It counts toward your allowance only once you approve the scope.
      </p>
      <div className="mt-1.5 flex flex-wrap justify-center gap-2">
        <Button variant="secondary" onClick={onClear}>
          Clear search
        </Button>
        <AppLink route="newRequest" className={buttonClassName()}>
          Request research on this
        </AppLink>
      </div>
      {suggestion && (
        <p className="mt-2.5 text-[13px] text-ink-400">
          Close to it:{" "}
          <AppLink
            route="sector"
            className="font-medium text-primary-700 dark:text-primary-200"
          >
            {suggestion}
          </AppLink>
        </p>
      )}
    </div>
  );
}
