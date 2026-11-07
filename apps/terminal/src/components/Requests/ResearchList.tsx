import clsx from "clsx";
import { Card } from "@sandworm/ui/kit/card";
import {
  ROW_HOVER_CLASSNAME,
  ROW_SELECTED_CLASSNAME,
} from "@sandworm/ui/kit/interactive";

import type { ResearchRequest } from "@/features/requests/types";

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
    <Card aria-labelledby="research-title" className="px-2 pb-2.5 pt-5">
      <h2
        id="research-title"
        className="px-3 pb-2 text-base font-medium text-ink-100"
      >
        Research requests
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
                ROW_HOVER_CLASSNAME,
                "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3.5 gap-y-1 px-3 py-3.5 text-left md:grid-cols-[minmax(0,1fr)_100px_130px]",
                isSelected && ROW_SELECTED_CLASSNAME
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
