import React, { useState } from "react";
import {
  PiThumbsUp,
  PiThumbsDown,
  PiFileCsv,
  PiFileText,
} from "react-icons/pi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { TooltipV2 } from "../Editor/blocks/ToolTips";
import { timeAgo, formatFullDate } from "../../lib/date";

import {
  BubbleReferencePill,
  PILL_BASE,
  PILL_ICON_CLASS,
  PILL_TEXT_CLASS,
} from "./ReferencePill";
import type { AttachedReference } from "./types";
import type { UploadedFileRef } from "./MiniChatInput";
import { useTypewriter } from "./useTypewriter";

// =====================================
// ⬢ Types
// =====================================

type Rating = "up" | "down" | null;

interface ChatBubbleProps {
  text: string;
  isUser: boolean;
  isStreaming?: boolean;
  references?: AttachedReference[];
  fileRefs?: UploadedFileRef[];
  createdAt?: string;
  onRate?: (rating: Rating) => void;
}

// =====================================
// ⬢ Markdown Components
// =====================================

type MDComponents = React.ComponentProps<typeof ReactMarkdown>["components"];

const MdP: NonNullable<MDComponents>["p"] = ({ children }) => (
  <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
);
const MdStrong: NonNullable<MDComponents>["strong"] = ({ children }) => (
  <strong className="font-semibold text-ink-300 dark:text-ink-200">
    {children}
  </strong>
);
const MdA: NonNullable<MDComponents>["a"] = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-[#185FA5] dark:text-[#85B7EB] underline underline-offset-2 hover:opacity-75 transition-opacity"
  >
    {children}
  </a>
);
const MdCode: NonNullable<MDComponents>["code"] = ({ className, children }) => {
  const isBlock = /language-(\w+)/.test(className ?? "");
  return isBlock ? (
    <code
      className={`${className ?? ""} font-mono text-xs text-ink-400 dark:text-ink-300`}
    >
      {children}
    </code>
  ) : (
    <code className="text-primary dark:text-primary-300 bg-[#F5E6FD] dark:bg-primary-920 px-1 py-0.5 rounded-[4px] text-[0.82em] font-mono">
      {children}
    </code>
  );
};
const MdPre: NonNullable<MDComponents>["pre"] = ({ children }) => (
  <pre className="bg-base-300 dark:bg-base-750 border border-border dark:border-base-700 rounded-lg p-3 overflow-x-auto mb-3 last:mb-0 text-xs leading-relaxed">
    {children}
  </pre>
);
const MdUl: NonNullable<MDComponents>["ul"] = ({ children }) => (
  <ul className="list-disc pl-4 mb-3 last:mb-0 space-y-1">{children}</ul>
);
const MdOl: NonNullable<MDComponents>["ol"] = ({ children }) => (
  <ol className="list-decimal pl-4 mb-3 last:mb-0 space-y-1">{children}</ol>
);
const MdLi: NonNullable<MDComponents>["li"] = ({ children }) => (
  <li className="leading-relaxed">{children}</li>
);
const MdH1: NonNullable<MDComponents>["h1"] = ({ children }) => (
  <h1 className="text-sm font-semibold text-ink-300 dark:text-ink-200 mb-1.5 mt-3 first:mt-0">
    {children}
  </h1>
);

const MdH2: NonNullable<MDComponents>["h2"] = ({ children }) => (
  <h2 className="text-[13px] font-semibold text-ink-300 dark:text-ink-200 mb-1 mt-2.5 first:mt-0">
    {children}
  </h2>
);

const MdH3: NonNullable<MDComponents>["h3"] = ({ children }) => (
  <h3 className="text-[13px] font-medium text-ink-300 dark:text-ink-200 mb-1 mt-2 first:mt-0">
    {children}
  </h3>
);
const MdBlockquote: NonNullable<MDComponents>["blockquote"] = ({
  children,
}) => (
  <blockquote className="border-l-2 border-border dark:border-base-710 pl-3 italic text-ink-400 dark:text-ink-500 mb-3 last:mb-0">
    {children}
  </blockquote>
);
const MdHr: NonNullable<MDComponents>["hr"] = () => (
  <hr className="border-border dark:border-base-710 mb-3" />
);

const MD_COMPONENTS: MDComponents = {
  p: MdP,
  strong: MdStrong,
  a: MdA,
  code: MdCode,
  pre: MdPre,
  ul: MdUl,
  ol: MdOl,
  li: MdLi,
  h1: MdH1,
  h2: MdH2,
  h3: MdH3,
  blockquote: MdBlockquote,
  hr: MdHr,
};

// =====================================
// ⬢ Markdown Message
// =====================================

function MarkdownMessage({ text }: { text: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
      {text}
    </ReactMarkdown>
  );
}

// =====================================
// ⬢ File Chip
// =====================================

function FileBubbleChip({ fileRef }: { fileRef: UploadedFileRef }) {
  const isCsv = fileRef.name.endsWith(".csv") || fileRef.name.endsWith(".xlsx");
  const Icon = isCsv ? PiFileCsv : PiFileText;

  return (
    <span
      className={`${PILL_BASE} ${PILL_TEXT_CLASS} text-[10.5px] px-1.5 py-[2.5px]`}
    >
      <Icon size={12} className={PILL_ICON_CLASS} />
      <span className="max-w-[120px] truncate">{fileRef.name}</span>
    </span>
  );
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
  const tooltipLabel = active
    ? "Unrate response"
    : type === "up"
      ? "Rate response"
      : "Not helpful";

  return (
    <TooltipV2<HTMLButtonElement> title={tooltipLabel} active position="top">
      {ref => (
        <button
          ref={ref}
          type="button"
          onClick={onClick}
          aria-label={tooltipLabel}
          aria-pressed={active}
          className={`p-1 rounded-md transition-all duration-150
            ${
              active
                ? type === "up"
                  ? "text-[#185FA5] bg-[#E6F1FB] dark:bg-[#0C1824] dark:text-[#85B7EB]"
                  : "text-warning bg-error-tint dark:bg-error-shade dark:text-[#F0997B]"
                : "text-ink-300 dark:text-ink-600 hover:text-ink-400 hover:bg-base-300 dark:hover:bg-base-720"
            }`}
        >
          <Icon size={13} />
        </button>
      )}
    </TooltipV2>
  );
}

// =====================================
// ⬢ Chat Bubble
// =====================================

export function ChatBubble({
  text,
  isUser,
  isStreaming = false,
  references = [],
  fileRefs = [],
  createdAt,
  onRate,
}: ChatBubbleProps) {
  const [rating, setRating] = useState<Rating>(null);
  const displayedText = useTypewriter(text, isStreaming);
  const stillTyping = isStreaming || displayedText.length < text.length;

  function handleRate(value: "up" | "down") {
    const next = rating === value ? null : value;
    setRating(next);
    onRate?.(next);
  }

  const hasAttachments =
    isUser && (references.length > 0 || (fileRefs?.length ?? 0) > 0);

  return (
    <div
      className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start w-full"}`}
    >
      {hasAttachments && (
        <div className="flex flex-wrap gap-1 max-w-[78%] justify-end mb-0.5">
          {references.map(ref => (
            <BubbleReferencePill key={ref.id} reference={ref} />
          ))}
          {fileRefs.map((file, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <FileBubbleChip key={`${file.name}-${i}`} fileRef={file} />
          ))}
        </div>
      )}

      {isUser ? (
        <div
          className="bg-[#eaedef] dark:bg-editor-600 rounded-2xl rounded-br-sm border border-border-secondary
            text-ink-500 dark:text-ink-400
            px-4 py-2.5 max-w-[78%] text-[13px] leading-relaxed
           break-words whitespace-pre-wrap min-w-[80px]"
        >
          {text}
        </div>
      ) : (
        <div
          className="w-full text-[13px] leading-relaxed
            text-ink-500 dark:text-ink-400
            [overflow-wrap:anywhere]"
        >
          <MarkdownMessage text={displayedText} />
          {stillTyping && (
            <span
              className="inline-block w-[2px] h-[1em] -mb-[2px] ml-0.5
                bg-ink-400 dark:bg-ink-300 animate-pulse align-middle"
            />
          )}
        </div>
      )}

      {isUser && createdAt && (
        <TooltipV2<HTMLSpanElement>
          title={formatFullDate(createdAt)}
          active
          className="text-[9px]"
          position="top"
        >
          {ref => (
            <span
              ref={ref}
              className="text-[10px] text-ink-300 dark:text-ink-600 cursor-default select-none"
            >
              {timeAgo(createdAt)}
            </span>
          )}
        </TooltipV2>
      )}

      {!isUser && (
        <div className="flex items-center gap-0.5 mt-0.5">
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
