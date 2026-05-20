"use client";

import React, { useState, useCallback } from "react";
import { PiArrowRight } from "react-icons/pi";

import type { FollowUpPart } from "./parts.types";

// =====================================
// ⬢ Types
// =====================================

interface FollowUpCardProps {
  part: FollowUpPart;
  onSubmit: (answers: Record<string, string>) => void;
  disabled?: boolean;
}

// =====================================
// ⬢ FollowUpCard
// =====================================

export function FollowUpCard({ part, onSubmit, disabled }: FollowUpCardProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      part.questions
        .filter(q => q.inputType === "radio" && q.options?.[0])
        .map(q => [q.id, q.options![0].value])
    )
  );

  const allAnswered = part.questions
    .filter(q => q.required !== false)
    .every(q => answers[q.id]?.trim());

  const handleChange = useCallback((id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!allAnswered || disabled) return;
    onSubmit(answers);
  }, [answers, allAnswered, disabled, onSubmit]);

  return (
    <div
      className="rounded-xl border border-border-secondary dark:border-[#2A2A28]
        bg-white dark:bg-[#1C1C1A] overflow-hidden"
    >
      {/* ─── Message ─── */}
      <div className="px-3 py-2.5 border-b border-border-secondary dark:border-[#2A2A28]">
        <p className="text-[12px] text-ink-400 dark:text-ink-400 leading-relaxed">
          {part.message}
        </p>
      </div>

      {/* ─── Questions ─── */}
      <div className="px-3 py-2 space-y-3">
        {part.questions.map(q => (
          <div key={q.id}>
            <p className="text-[11.5px] font-medium text-ink-500 dark:text-ink-200 mb-1.5">
              {q.text}
            </p>

            {q.inputType === "radio" && q.options && (
              <div className="flex flex-col gap-1">
                {q.options.map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg
                      border cursor-pointer transition-all duration-100
                      ${answers[q.id] === opt.value
                        ? "border-[#A308F0] bg-[#F9F0FF] dark:bg-[#1F0A2E] dark:border-[#7A06B8]"
                        : "border-border-secondary dark:border-[#2A2A28] hover:border-[#C97FF5] dark:hover:border-[#5A059A]"
                      }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={opt.value}
                      checked={answers[q.id] === opt.value}
                      onChange={() => handleChange(q.id, opt.value)}
                      className="accent-[#A308F0] flex-shrink-0"
                      disabled={disabled}
                    />
                    <span className="text-[11.5px] text-ink-500 dark:text-ink-200">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {q.inputType === "text" && (
              <input
                type="text"
                value={answers[q.id] ?? ""}
                onChange={e => handleChange(q.id, e.target.value)}
                placeholder={q.placeholder}
                disabled={disabled}
                className="w-full text-[12px] bg-[#F1F3F4] dark:bg-[#2A2A28]
                  border border-transparent rounded-lg px-2.5 py-1.5
                  outline-none text-ink-500 dark:text-ink-200
                  placeholder:text-ink-300 dark:placeholder:text-ink-600
                  focus:border-[#A308F0] dark:focus:border-[#7A06B8]
                  transition-colors disabled:opacity-50"
              />
            )}
          </div>
        ))}
      </div>

      {/* ─── Submit ─── */}
      <div className="px-3 pb-2.5">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allAnswered || disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
            text-[12px] font-medium transition-colors
            bg-[#A308F0] hover:bg-[#8A06CC] text-white
            disabled:bg-[#E4C4F9] dark:disabled:bg-[#2A1040]
            disabled:cursor-not-allowed"
        >
          Proceed
          <PiArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}