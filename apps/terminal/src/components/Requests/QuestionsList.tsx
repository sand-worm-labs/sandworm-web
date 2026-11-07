import { PiChatCircleText } from "react-icons/pi";
import { Card } from "@sandworm/ui/kit/card";

import type { QuestionEntry } from "@/lib/requests/types";

import { StatusChip } from "./StatusChip";

export function QuestionsList({
  questions,
}: {
  questions: readonly QuestionEntry[];
}) {
  return (
    <Card aria-labelledby="questions-title" className="px-4 pb-2.5 pt-5">
      <div className="flex items-baseline justify-between gap-3 px-2 pb-2">
        <h2 id="questions-title" className="text-base font-medium text-ink-100">
          Questions
        </h2>
      </div>
      {questions.map((question, index) => {
        return (
          <div
            key={question.id}
            className={
              index > 0
                ? "grid grid-cols-[30px_minmax(0,1fr)_auto] items-center gap-x-3.5 gap-y-1 border-t border-border-secondary px-2 py-3.5 md:grid-cols-[30px_minmax(0,1fr)_90px_130px]"
                : "grid grid-cols-[30px_minmax(0,1fr)_auto] items-center gap-x-3.5 gap-y-1 px-2 py-3.5 md:grid-cols-[30px_minmax(0,1fr)_90px_130px]"
            }
          >
            <span
              aria-hidden="true"
              className="flex size-[30px] items-center justify-center rounded-[9px] bg-primary-tint-75 text-primary-700 dark:bg-primary-910 dark:text-primary-200"
            >
              <PiChatCircleText size={15} />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-medium text-ink-100">
                {question.title}
              </span>
              <span className="text-[13px] text-ink-400">
                {question.detail}
              </span>
            </span>
            <StatusChip status={question.status} />
            <span className="whitespace-nowrap text-xs text-ink-400 md:text-right">
              {question.when}
            </span>
          </div>
        );
      })}
    </Card>
  );
}
