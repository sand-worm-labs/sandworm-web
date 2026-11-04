import clsx from "clsx";

import { Card } from "@/components/Card";

import type { ResearchRequest } from "../types";

import { StatusChip } from "./StatusChip";

type ResearchListProps = {
  requests: readonly ResearchRequest[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
};

export function ResearchList({
  requests,
  selectedId,
  onSelect,
}: ResearchListProps) {
  return (
    <Card aria-labelledby="research-title" className="px-3 pb-2.5 pt-5">
      <h2
        id="research-title"
        className="px-2.5 pb-2 text-base font-medium text-ink-100"
      >
        Commissioned research
      </h2>
      {requests.map((request, index) => {
        const isSelected = request.id === selectedId;
        return (
          <div
            key={request.id}
            className={
              index > 0 && !isSelected
                ? "border-t border-border-secondary"
                : undefined
            }
          >
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(request.id)}
              className={clsx(
                "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3.5 gap-y-1 rounded-xl px-2.5 py-3.5 text-left transition-colors md:grid-cols-[minmax(0,1fr)_100px_130px]",
                isSelected
                  ? "bg-primary-tint-50 ring-1 ring-inset ring-primary-tint-100 dark:bg-primary-910 dark:ring-border-tertiary"
                  : "hover:bg-primary-tint-50 dark:hover:bg-dropdown-hover"
              )}
            >
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-medium text-ink-100">
                  {request.title}
                </span>
                <span className="text-xs text-ink-400">{request.by}</span>
              </span>
              <StatusChip status={request.status} />
              <span className="text-xs text-ink-500 md:text-right">
                {request.next}
              </span>
            </button>
          </div>
        );
      })}
    </Card>
  );
}
