"use client";

import React from "react";

import type { LocalMessage } from "../Editor/hooks/useMiniChat";

import { ChatBubble } from "./ChatBubble";
import { MiniChatEmptyState } from "./MiniChatEmptyState";

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
}

export const MiniChatMessages: React.FC<MiniChatMessagesProps> = ({
  messages,
  bottomRef,
  onSelectPrompt,
  onVote,
  onRemoveVote,
}) => (
  <div className="flex-1 overflow-y-auto py-6 px-4">
    {messages.length === 0 ? (
      <MiniChatEmptyState onSelectPrompt={onSelectPrompt} />
    ) : (
      <div className="flex flex-col w-full gap-4">
        {messages.map(msg =>
          msg.isLoading ? (
            <LoadingBubble key={msg.id} />
          ) : (
            <ChatBubble
              key={msg.id}
              text={msg.text}
              isUser={msg.isUser}
              references={msg.references}
              files={msg.files}
              onRate={rating => {
                if (!msg.messageId) return;
                if (rating === null) {
                  onRemoveVote(msg.messageId);
                } else {
                  onVote(msg.messageId, rating === "up");
                }
              }}
            />
          )
        )}
        <div ref={bottomRef} />
      </div>
    )}
  </div>
);
