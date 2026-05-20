"use client";

import React from "react";

import type { LocalMessage } from "../Editor/hooks/useMiniChat";

import { MessageParts } from "./MessageParts";
import { PendingReviewCard } from "./PendingReviewCard";
import { FollowUpCard } from "./FollowUpCard";
import { ChatBubble } from "./ChatBubble";
import { MiniChatEmptyState } from "./MiniChatEmptyState";
import type {
  PartPayload,
  PendingReviewPart,
  FollowUpPart,
} from "./parts.types";

// =====================================
// ⬢ LoadingBubble
// =====================================

const LoadingBubble: React.FC = () => (
  <div className="flex justify-start">
    <div className="bg-[#F1F3F4] dark:bg-[#121417] text-ink-500 dark:text-ink-400 px-4 py-3 rounded-2xl text-sm flex gap-1 items-center">
      <span className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-bounce [animation-delay:0ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-bounce [animation-delay:150ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-bounce [animation-delay:300ms]" />
    </div>
  </div>
);

// =====================================
// ⬢ MiniChatMessages
// =====================================

interface MiniChatMessagesProps {
  messages: LocalMessage[];
  bottomRef: React.RefObject<HTMLDivElement>;
  onSelectPrompt: (prompt: string) => void;
  onVote: (messageId: string, isUpvoted: boolean) => void;
  onRemoveVote: (messageId: string) => void;
  onFollowUpSubmit: (answers: Record<string, string>) => void;
  onAcceptAll: (messageId: string) => void;
  onRejectAll: (messageId: string) => void;
}

export const MiniChatMessages: React.FC<MiniChatMessagesProps> = ({
  messages,
  bottomRef,
  onSelectPrompt,
  onVote,
  onRemoveVote,
  onFollowUpSubmit,
  onAcceptAll,
  onRejectAll,
}) => (
  <div className="flex-1 overflow-y-auto py-6 px-4">
    {messages.length === 0 ? (
      <MiniChatEmptyState onSelectPrompt={onSelectPrompt} />
    ) : (
      <div className="flex flex-col w-full gap-4">
        {messages.map(msg => {
          // ─── Still loading and no text yet — show dots ────
          if (msg.isLoading && !msg.text) {
            return <LoadingBubble key={msg.id} />;
          }

          const streamParts = (msg.streamParts ?? []) as PartPayload[];
          const pendingReview = streamParts.find(
            p => p.type === "pending_review"
          ) as PendingReviewPart | undefined;
          const followUp = streamParts.find(p => p.type === "follow_up") as
            | FollowUpPart
            | undefined;

          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1.5 w-full ${msg.isUser ? "items-end" : "items-start"}`}
            >
              {/* ─── Parts above bubble (thinking, tools, blocks) ── */}
              {!msg.isUser && streamParts.length > 0 && (
                <div className="w-full">
                  <MessageParts parts={streamParts} />
                </div>
              )}

              {/* ─── Main bubble ─── */}
              {(msg.text || msg.isLoading) && (
                <ChatBubble
                  text={msg.text}
                  isUser={msg.isUser}
                  references={msg.references}
                  files={msg.files}
                  onRate={rating => {
                    if (!msg.messageId) return;
                    if (rating === null) onRemoveVote(msg.messageId);
                    else onVote(msg.messageId, rating === "up");
                  }}
                />
              )}

              {/* ─── Pending review below bubble ─── */}
              {!msg.isUser && pendingReview && (
                <div className="w-full">
                  <PendingReviewCard
                    part={pendingReview}
                    onAcceptAll={() =>
                      msg.messageId && onAcceptAll(msg.messageId)
                    }
                    onRejectAll={() =>
                      msg.messageId && onRejectAll(msg.messageId)
                    }
                  />
                </div>
              )}

              {/* ─── Follow-up below bubble ─── */}
              {!msg.isUser && followUp && (
                <div className="w-full">
                  <FollowUpCard part={followUp} onSubmit={onFollowUpSubmit} />
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    )}
  </div>
);
