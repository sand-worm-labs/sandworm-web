"use client";

import React, { useCallback, useEffect, useState } from "react";
import { PiArrowRight, PiArrowLeft } from "react-icons/pi";

import type { ActiveFollowUpStep } from "../Editor/hooks/useMiniChat";
import type { FollowUpPart, FollowUpQuestion } from "./parts.types";
import { useTypewriter } from "./useTypewriter";

// =====================================
// ⬢ Types
// =====================================

interface FollowUpCardProps {
  part: FollowUpPart;
  onSubmit: (summary: string) => void;
  disabled?: boolean;
  isStreaming?: boolean;
  // "text" steps route their answer through the main chat input instead of
  // an embedded box — pass null when this card isn't the one currently
  // driving the input (e.g. it belongs to an older message).
  onActiveTextStepChange?: (step: ActiveFollowUpStep | null) => void;
}

// =====================================
// ⬢ FollowUpCard
// =====================================

export function FollowUpCard({
  part,
  onSubmit,
  disabled,
  isStreaming = false,
  onActiveTextStepChange,
}: FollowUpCardProps) {
  const displayedMessage = useTypewriter(part.message, isStreaming);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const isDisabled = disabled || submitted;
  const [answers, setAnswers] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        part.questions
          .filter(
            q =>
              (q.input_type === "option" || q.input_type === "select") &&
              q.options?.[0]
          )
          .map(q => [q.id, q.options?.[0]?.value])
      ) as Record<string, string>
  );

  const total = part.questions.length;
  const isLastStep = step === total - 1;
  const question = part.questions[step];

  // If the currently-stored answer matches a free_text option's own value,
  // the user picked the escape hatch ("Something else") but hasn't typed
  // their actual answer yet — that doesn't count as answered.
  const isAnswered = useCallback(
    (q: FollowUpQuestion) => {
      if (q.required === false) return true;
      const value = answers[q.id];
      if (!value?.trim()) return false;
      const picked = q.options?.find(o => o.value === value);
      return !picked?.free_text;
    },
    [answers]
  );

  const allAnswered = part.questions.every(isAnswered);
  const currentAnswered = question ? isAnswered(question) : false;

  const selectedOption = question?.options?.find(
    o => o.value === answers[question.id]
  );
  const pendingElaboration = selectedOption?.free_text === true;
  const isElaboratedText =
    (question?.input_type === "option" || question?.input_type === "select") &&
    !!answers[question.id] &&
    !question.options?.some(o => o.value === answers[question.id]);

  const handleChange = useCallback((id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  }, []);

  // Turn the raw {questionId: value} map into something readable to send as
  // a chat message — the option's label when one was picked, the typed text
  // otherwise. Never expose internal question ids/values verbatim.
  const buildSummary = useCallback(
    (finalAnswers: Record<string, string>) =>
      part.questions
        .map(q => {
          const value = finalAnswers[q.id];
          if (!value) return null;
          const opt = q.options?.find(o => o.value === value);
          return opt && !opt.free_text ? opt.label : value;
        })
        .filter((v): v is string => !!v)
        .join(", "),
    [part.questions]
  );

  const handleBack = useCallback(() => {
    setStep(s => Math.max(0, s - 1));
  }, []);

  const handleNext = useCallback(() => {
    if (!currentAnswered || isDisabled) return;
    setStep(s => Math.min(total - 1, s + 1));
  }, [currentAnswered, isDisabled, total]);

  const handleSubmit = useCallback(() => {
    if (!allAnswered || isDisabled) return;
    setSubmitted(true);
    onSubmit(buildSummary(answers));
  }, [answers, allAnswered, isDisabled, onSubmit, buildSummary]);

  // Answers typed into the main input arrive here — computed synchronously
  // (rather than relying on the `answers` state that setAnswers just queued)
  // so a last-step answer can be checked and submitted in the same call.
  const submitTextAnswer = useCallback(
    (value: string) => {
      if (!question || isDisabled) return;
      const next = { ...answers, [question.id]: value };
      setAnswers(next);
      if (isLastStep) {
        const complete = part.questions.every(
          q => q.required === false || !!next[q.id]?.trim()
        );
        if (complete) {
          setSubmitted(true);
          onSubmit(buildSummary(next));
        }
      } else {
        setStep(s => Math.min(total - 1, s + 1));
      }
    },
    [
      question,
      isDisabled,
      answers,
      isLastStep,
      part.questions,
      onSubmit,
      total,
      buildSummary,
    ]
  );

  useEffect(() => {
    if (!onActiveTextStepChange) return undefined;

    if (submitted) {
      onActiveTextStepChange(null);
      return () => onActiveTextStepChange(null);
    }

    if (question?.input_type === "text") {
      onActiveTextStepChange({
        prompt: question.text,
        placeholder: question.placeholder,
        onAnswer: submitTextAnswer,
      });
    } else if (pendingElaboration) {
      onActiveTextStepChange({
        prompt: selectedOption?.label ?? question!.text,
        placeholder: "Describe what you mean...",
        onAnswer: submitTextAnswer,
      });
    } else {
      onActiveTextStepChange(null);
    }

    return () => onActiveTextStepChange(null);
  }, [
    question,
    pendingElaboration,
    selectedOption,
    submitted,
    onActiveTextStepChange,
    submitTextAnswer,
  ]);

  if (!question) return null;

  const awaitingTextInput =
    question.input_type === "text" || pendingElaboration;
  const showFooter = step > 0 || !awaitingTextInput;

  return (
    <div
      className="rounded-xl border border-border-secondary dark:border-base-700
        bg-white dark:bg-base-730 overflow-hidden"
    >
      <div className="px-3 py-2.5 border-b border-border-secondary dark:border-base-700 space-y-1.5">
        <p className="text-[12px] text-ink-400 dark:text-ink-400 leading-relaxed">
          {displayedMessage}
        </p>
        {total > 1 && (
          <div className="flex items-center gap-1">
            {part.questions.map((q, i) => (
              <span
                key={q.id}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === step
                    ? "w-5 bg-primary"
                    : i < step
                      ? "w-1.5 bg-primary/50"
                      : "w-1.5 bg-base-300 dark:bg-base-700"
                }`}
              />
            ))}
            <span className="ml-1 text-[10px] text-ink-300 dark:text-ink-600 tabular-nums">
              {step + 1}/{total}
            </span>
          </div>
        )}
      </div>

      <div className="px-3 py-2">
        <div key={question.id}>
          <p className="text-[11.5px] font-medium text-ink-500 dark:text-ink-200 mb-1.5">
            {question.text}
          </p>

          {question.input_type === "option" && question.options && (
            <div className="flex flex-col gap-1">
              {question.options.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg
                    border cursor-pointer transition-all duration-100
                    ${
                      answers[question.id] === opt.value
                        ? "border-primary bg-[#F9F0FF] dark:bg-primary-920 dark:border-primary-700"
                        : "border-border-secondary dark:border-base-700 hover:border-primary-300 dark:hover:border-[#5A059A]"
                    }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={opt.value}
                    checked={answers[question.id] === opt.value}
                    onChange={() => handleChange(question.id, opt.value)}
                    className="accent-primary flex-shrink-0"
                    disabled={isDisabled}
                  />
                  <span className="text-[11.5px] text-ink-500 dark:text-ink-200">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          )}

          {question.input_type === "select" && question.options && (
            <select
              value={answers[question.id] ?? ""}
              onChange={e => handleChange(question.id, e.target.value)}
              disabled={isDisabled}
              className="w-full px-2.5 py-1.5 rounded-lg text-[11.5px]
                border border-border-secondary dark:border-base-700
                bg-white dark:bg-base-730 text-ink-500 dark:text-ink-200
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:border-primary"
            >
              <option value="" disabled>
                Select an option...
              </option>
              {question.options.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {(question.input_type === "text" ||
            pendingElaboration ||
            isElaboratedText) && (
            <div className={pendingElaboration ? "mt-2" : undefined}>
              {answers[question.id] && !pendingElaboration ? (
                <div
                  className="px-2.5 py-1.5 rounded-lg text-[12px]
                    border border-border-secondary dark:border-base-700
                    bg-base-300 dark:bg-base-700
                    text-ink-500 dark:text-ink-200"
                >
                  {answers[question.id]}
                </div>
              ) : (
                <p className="text-[11.5px] italic text-ink-300 dark:text-ink-600">
                  Type your answer in the message box below ↓
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {showFooter && (
        <div className="px-3 pb-2.5 flex items-center justify-between gap-2">
          {step > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isDisabled}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                text-[12px] font-medium transition-colors
                text-ink-400 dark:text-ink-300
                hover:bg-base-300 dark:hover:bg-base-720
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PiArrowLeft size={13} />
              Back
            </button>
          ) : (
            <span />
          )}

          {!awaitingTextInput &&
            (isLastStep ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!allAnswered || isDisabled}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  text-[12px] font-medium transition-colors
                  bg-primary hover:bg-primary-710 text-white
                  disabled:bg-[#E4C4F9] dark:disabled:bg-[#2A1040]
                  disabled:cursor-not-allowed"
              >
                Proceed
                <PiArrowRight size={13} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={!currentAnswered || isDisabled}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  text-[12px] font-medium transition-colors
                  bg-primary hover:bg-primary-710 text-white
                  disabled:bg-[#E4C4F9] dark:disabled:bg-[#2A1040]
                  disabled:cursor-not-allowed"
              >
                Next
                <PiArrowRight size={13} />
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
