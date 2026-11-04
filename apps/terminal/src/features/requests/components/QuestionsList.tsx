import { PiChatCircleText, PiPhone } from "react-icons/pi";

import { AppLink } from "@/components/AppLink";
import { buttonClassName } from "@/components/Button";
import { Card } from "@/components/Card";

import type { QuestionEntry } from "../types";

import { StatusChip } from "./StatusChip";

const KIND_ICON = {
  call: {
    Icon: PiPhone,
    className: "bg-info-tint text-ink-navy dark:bg-base-600",
  },
  question: {
    Icon: PiChatCircleText,
    className:
      "bg-primary-tint-75 text-primary-700 dark:bg-primary-910 dark:text-primary-200",
  },
} as const satisfies Record<QuestionEntry["kind"], unknown>;

export function QuestionsList({
  questions,
}: {
  questions: readonly QuestionEntry[];
}) {
  return (
    <Card aria-labelledby="questions-title" className="px-4 pb-2.5 pt-5">
      <div className="flex items-baseline justify-between gap-3 px-2 pb-2">
        <h2 id="questions-title" className="text-base font-medium text-ink-100">
          Questions and calls
        </h2>
        <AppLink
          route="bookCall"
          className={buttonClassName({
            variant: "link",
            className: "text-[13px] font-medium",
          })}
        >
          Ask an analyst
        </AppLink>
      </div>
      {questions.map((question, index) => {
        const { Icon, className } = KIND_ICON[question.kind];
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
              className={`flex size-[30px] items-center justify-center rounded-[9px] ${className}`}
            >
              <Icon size={15} />
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
