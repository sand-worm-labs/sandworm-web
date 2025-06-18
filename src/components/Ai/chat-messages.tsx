"use client";

import { useEffect, useRef } from "react";

import { ChatMessage } from "@/components/chat-message";
import { USER_NAME } from "@/constants";
import { Citation } from "@/types/chat";
import { ChatMessage as ChatMessageType } from "@/types/chat-message";
import { assert } from "@/utils/assert";

interface ChatMessagesProps {
  messages: ChatMessageType[];
  citationsMap: Record<number, Citation[]>;
  followUpPromptsMap: Record<number, string[]>;
  onFollowUpClick: (prompt: string) => void;
}

export function ChatMessages({
  messages,
  citationsMap,
  followUpPromptsMap,
  onFollowUpClick,
}: ChatMessagesProps) {
  assert(
    Array.isArray(messages),
    `[ChatMessages] 'messages' prop is not an array: ${typeof messages}`,
  );
  assert(
    typeof citationsMap === "object" && citationsMap !== null,
    `[ChatMessages] 'citationsMap' prop is not an object: ${typeof citationsMap}`,
  );
  assert(
    typeof followUpPromptsMap === "object" && followUpPromptsMap !== null,
    `[ChatMessages] 'followUpPromptsMap' prop is not an object: ${typeof followUpPromptsMap}`,
  );
  assert(
    typeof onFollowUpClick === "function",
    `[ChatMessages] 'onFollowUpClick' prop is not a function: ${typeof onFollowUpClick}`,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<string>("");
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "instant") => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight + 400,
        behavior,
      });
    }, 100);
  };

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    assert(
      lastMessage && typeof lastMessage === "object",
      `[ChatMessages Effect 1] Invalid lastMessage (index ${messages.length - 1})`,
    );
    if (!lastMessage) return;
    assert(
      typeof lastMessage.text === "string" ||
        lastMessage.text === null ||
        lastMessage.text === undefined,
      `[ChatMessages Effect 1] Invalid lastMessage.text (index ${messages.length - 1}): ${typeof lastMessage.text}`,
    );

    const currentText = lastMessage.text ?? "";
    const isNewMessage = currentText !== lastMessageRef.current;

    if (isNewMessage) {
      lastMessageRef.current = currentText;
      scrollToBottom("instant");
    }
  }, [messages]);

  useEffect(() => {
    if (!messages.length) return;
    const lastMessage = messages[messages.length - 1];
    assert(
      lastMessage && typeof lastMessage === "object",
      `[ChatMessages Effect 2] Invalid lastMessage (index ${messages.length - 1})`,
    );
    if (!lastMessage) return;
    assert(
      typeof lastMessage.name === "string",
      `[ChatMessages Effect 2] Invalid lastMessage.name (index ${messages.length - 1}): ${typeof lastMessage.name}`,
    );
    assert(
      typeof lastMessage.text === "string" ||
        lastMessage.text === null ||
        lastMessage.text === undefined,
      `[ChatMessages Effect 2] Invalid lastMessage.text (index ${messages.length - 1}): ${typeof lastMessage.text}`,
    );

    if (lastMessage.name !== USER_NAME) {
      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100;

      if (isAtBottom) {
        scrollToBottom();
      }
    }
  }, [messages[messages.length - 1]?.text]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  console.log({
    messages,
    citationsMap,
    followUpPromptsMap,
  });

  console.log("[ChatMessages Render] Rendering with messages prop:", messages);
  return (
    <div className="flex flex-col gap-4">
      {messages.map((message, i) => {
        assert(
          message && typeof message === "object",
          `[ChatMessages Map] Invalid message at index ${i}`,
        );
        if (!message) return null;
        const messageKey = message.id || message.createdAt;
        assert(
          messageKey,
          `[ChatMessages Map] Message at index ${i} lacks id and createdAt for key.`,
        );
        assert(
          typeof message.name === "string",
          `[ChatMessages Map] Invalid message.name at index ${i}: ${typeof message.name}`,
        );

        const assistantIndex =
          message.name !== USER_NAME
            ? messages.slice(0, i + 1).filter((m) => m.name !== USER_NAME)
                .length - 1
            : -1;

        return (
          <div
            key={messageKey}
            ref={i === messages.length - 1 ? messagesEndRef : undefined}
          >
            <ChatMessage
              message={message}
              i={i}
              citations={
                message.name !== USER_NAME ? citationsMap[i] : undefined
              }
              followUpPrompts={
                message.name !== USER_NAME
                  ? followUpPromptsMap[assistantIndex]
                  : undefined
              }
              onFollowUpClick={onFollowUpClick}
            />
          </div>
        );
      })}
    </div>
  );
}
