"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import type { LocalMessage } from "../Editor/hooks/useMiniChat";

import { MessageParts } from "./MessageParts";
import { FollowUpCard } from "./FollowUpCard";
import { ChatBubble } from "./ChatBubble";
import { MiniChatEmptyState } from "./MiniChatEmptyState";
import type { PartPayload, FollowUpPart } from "./parts.types";

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
}) => (
  <div className="flex-1 overflow-y-auto py-6 px-4">
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
                    <LoadingBubble />
                  </motion.div>
                )}
              </AnimatePresence>

              {(msg.text || (msg.isLoading && !hasParts)) && (
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
