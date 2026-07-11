"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiArrowDown } from "react-icons/pi";

import type { LocalMessage } from "../Editor/hooks/useMiniChat";

import { MessageParts } from "./MessageParts";
import { FollowUpCard } from "./FollowUpCard";
import { ChatBubble } from "./ChatBubble";
import { MiniChatEmptyState } from "./MiniChatEmptyState";
import type { PartPayload, FollowUpPart } from "./parts.types";
import RotatingGradientRing from "./RotatingGradientRing";

// =====================================
// ⬢ LoadingBubble
// =====================================

const LoadingBubble: React.FC = () => (
  <div className="flex justify-start">
    <div
      className="bg-[#F1F3F4] dark:bg-[#121417] text-ink-500 dark:text-ink-400
        px-4 py-3 rounded-2xl text-sm flex gap-1 items-center"
    >
      <div className="dot-loader" />
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
}

export const MiniChatMessages: React.FC<MiniChatMessagesProps> = ({
  messages,
  bottomRef,
  onSelectPrompt,
  onVote,
  onRemoveVote,
  onFollowUpSubmit,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    isAtBottomRef.current = atBottom;
    setIsAtBottom(atBottom);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Auto-scroll only when user is already at the bottom
  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, bottomRef]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    isAtBottomRef.current = true;
    setIsAtBottom(true);
  }, [bottomRef]);

  return (
    <div className="flex-1 min-h-0 relative">
      <div
        ref={scrollContainerRef}
        className="absolute inset-0 overflow-y-auto py-6 px-4"
      >
        {messages.length === 0 ? (
          <MiniChatEmptyState onSelectPrompt={onSelectPrompt} />
        ) : (
          <div className="flex flex-col w-full gap-4">
            {messages.map(msg => {
              const streamParts = (msg.streamParts ?? []) as PartPayload[];
              const hasParts = streamParts.length > 0;
              const followUp = streamParts.find(p => p.type === "follow_up") as
                | FollowUpPart
                | undefined;

              if (msg.isLoading && !msg.text && !hasParts) {
                return <LoadingBubble key={msg.id} />;
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-1.5 w-full ${
                    msg.isUser ? "items-end" : "items-start"
                  }`}
                >
                  {!msg.isUser && hasParts && (
                    <div className="w-full">
                      <MessageParts
                        parts={streamParts}
                        isLoading={!!msg.isLoading}
                      />
                    </div>
                  )}

                  <AnimatePresence>
                    {!msg.isUser && msg.isLoading && !msg.text && hasParts && (
                      <motion.div
                        key="inline-loader"
                        initial={{ opacity: 1 }}
                        exit={{
                          opacity: 0,
                          transition: { duration: 0.2, ease: "easeOut" },
                        }}
                      >
                        <RotatingGradientRing />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {(msg.text || (msg.isLoading && !hasParts)) && (
                    <ChatBubble
                      text={msg.text}
                      isUser={msg.isUser}
                      references={msg.references}
                      fileRefs={msg.fileRefs}
                      createdAt={msg.createdAt}
                      onRate={rating => {
                        if (!msg.messageId) return;
                        if (rating === null) onRemoveVote(msg.messageId);
                        else onVote(msg.messageId, rating === "up");
                      }}
                    />
                  )}

                  {!msg.isUser && followUp && (
                    <div className="w-full">
                      <FollowUpCard
                        part={followUp}
                        onSubmit={onFollowUpSubmit}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {!isAtBottom && (
          <motion.button
            key="scroll-to-latest"
            type="button"
            onClick={scrollToBottom}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { type: "spring", stiffness: 500, damping: 30 },
            }}
            exit={{
              opacity: 0,
              y: 10,
              scale: 0.9,
              transition: { duration: 0.15 },
            }}
            className="absolute bottom-3 left-[35%] z-10
              flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.65rem] font-medium
              bg-white dark:bg-[#1A1A18]
              border border-[#DEE2E6] dark:border-[#2A2A28]
              text-ink-400 dark:text-ink-300
              shadow-sm hover:shadow-md
              hover:bg-[#F8F9FA] dark:hover:bg-[#222220]
              transition-colors"
          >
            <PiArrowDown size={12} />
            Scroll to latest
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
