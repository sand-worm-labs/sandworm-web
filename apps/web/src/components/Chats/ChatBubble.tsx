import React, { useState } from "react";
import { PiThumbsUp, PiThumbsDown } from "react-icons/pi";

import { BubbleReferencePill } from "./ReferencePill";
import type { AttachedReference } from "./types";

// =====================================
// ⬢ Types
// =====================================
type Rating = "up" | "down" | null;

interface ChatBubbleProps {
  text: string;
  isUser: boolean;
  references?: AttachedReference[];
  onRate?: (rating: Rating) => void;
}

// =====================================
// ⬢ Rating Button
// =====================================
interface RatingButtonProps {
  type: "up" | "down";
  active: boolean;
  onClick: () => void;
}

function RatingButton({ type, active, onClick }: RatingButtonProps) {
  const Icon = type === "up" ? PiThumbsUp : PiThumbsDown;
  const label = type === "up" ? "Helpful" : "Not helpful";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`p-1 rounded-md transition-all duration-150
        ${
          active
            ? type === "up"
              ? "text-[#185FA5] bg-[#E6F1FB] dark:bg-[#0C1824] dark:text-[#85B7EB]"
              : "text-[#D85A30] bg-[#FAECE7] dark:bg-[#1A0D08] dark:text-[#F0997B]"
            : "text-ink-300 dark:text-ink-600 hover:text-ink-400 hover:bg-[#F1F3F4] dark:hover:bg-[#252523]"
        }`}
    >
      <Icon size={13} />
    </button>
  );
}

// =====================================
// ⬢ Chat Bubble
// =====================================
export function ChatBubble({
  text,
  isUser,
  references = [],
  onRate,
}: ChatBubbleProps) {
  const [rating, setRating] = useState<Rating>(null);

  function handleRate(value: "up" | "down") {
    const next = rating === value ? null : value;
    setRating(next);
    onRate?.(next);
  }

  return (
    <div
      className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
    >
      {isUser && references.length > 0 && (
        <div className="flex flex-wrap gap-1 max-w-[78%] justify-end mb-0.5">
          {references.map(ref => (
            <BubbleReferencePill key={ref.id} reference={ref} />
          ))}
        </div>
      )}

      <div
        className={`
          ${
            isUser
              ? "bg-[#DEFCFE] dark:bg-[#121417] rounded-br-sm"
              : "bg-[#F1F3F4] dark:bg-[#121417] rounded-bl-sm"
          }
          text-ink-500 dark:text-ink-400
          px-4 py-2.5 rounded-2xl max-w-[78%] text-sm leading-relaxed
        `}
      >
        {text}
      </div>

      {!isUser && (
        <div className="flex items-center gap-0.5 pl-1">
          <RatingButton
            type="up"
            active={rating === "up"}
            onClick={() => handleRate("up")}
          />
          <RatingButton
            type="down"
            active={rating === "down"}
            onClick={() => handleRate("down")}
          />
        </div>
      )}
    </div>
  );
}
