"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Transition } from "@headlessui/react";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import type * as Y from "yjs";

import { AIChatIcon } from "../Assets/AIChatIcon";
import { useNotebookAI } from "../Visualization/hooks/useNotebookAI";
import type { APIDataSources } from "../Visualization/hooks/useDataSources";

import { MiniChatInput } from "./MiniChatInput";

// ── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  isLoading?: boolean;
}

// ── Header ──────────────────────────────────────────────────────────────────

interface MiniChatHeaderProps {
  onCancel?: () => void;
}

export const MiniChatHeader: React.FC<MiniChatHeaderProps> = ({ onCancel }) => {
  return (
    <header className="flex items-center justify-between bg-white dark:bg-base-100 border-b border-border-secondary border-dashed dark:border-border-secondary">
      <div className="flex-col flex">
        <h3 className="text-lg font-medium leading-6 dark:text-white text-ink-100 px-4 pt-6 xl:px-6">
          Sandworm agent
        </h3>
        <p className="text-sm text-ink-400 px-4 mb-4 xl:px-6">
          Create deep and insightful analysis
        </p>
      </div>
      <button
        type="button"
        aria-label="Cancel chat"
        onClick={() => onCancel?.()}
        className="absolute z-10 top-7 transform rounded-full border border-gray-300 text-ink-400 bg-base-100 hover:bg-gray-100 w-6 h-6 flex justify-center items-center right-3 -translate-x-1/2 dark:border-border-tertiary"
      >
        <ChevronDoubleRightIcon className="w-3 h-3" />
      </button>
    </header>
  );
};

// ── Example prompts ─────────────────────────────────────────────────────────

const EXAMPLE_PROMPTS = [
  {
    label: "Token analytics",
    prompt:
      "Show me the top 20 holders of USDC on Base, including their balance changes over the past 30 days",
  },
  {
    label: "Python analysis",
    prompt:
      "Use Python to cluster wallets on Base by their transaction behaviour and flag any that look like bots",
  },
  {
    label: "Visualize",
    prompt:
      "Create a chart showing daily DEX trading volume on Base broken down by protocol over the last 60 days",
  },
];

interface ExamplePromptsProps {
  onSelect: (prompt: string) => void;
}

const ExamplePrompts: React.FC<ExamplePromptsProps> = ({ onSelect }) => (
  <div className="flex flex-col gap-2 w-full mt-6">
    {EXAMPLE_PROMPTS.map(item => (
      <button
        key={item.label}
        type="button"
        onClick={() => onSelect(item.prompt)}
        className="group flex items-start gap-3 w-full text-left px-4 py-2.5 rounded-xl border border-border-secondary dark:border-border-tertiary bg-white dark:bg-base-200 hover:border-primary/40 dark:hover:border-primary/40 hover:bg-primary/[0.03] dark:hover:bg-primary/[0.06] transition-all duration-150"
      >
        <span className="flex flex-col min-w-0">
          <span className="text-[11px] font-semibold text-ink-100 mb-0.5">
            {item.label}
          </span>
          <span className="text-[12.5px] text-ink-400 dark:text-ink-400 leading-snug line-clamp-2 group-hover:text-ink-200 dark:group-hover:text-ink-300 transition-colors duration-150">
            {item.prompt}
          </span>
        </span>
      </button>
    ))}
  </div>
);

// ── Empty state ─────────────────────────────────────────────────────────────

interface MiniChatEmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export const MiniChatEmptyState: React.FC<MiniChatEmptyStateProps> = ({
  onSelectPrompt,
}) => (
  <div className="flex flex-col items-center py-8 font-body justify-end h-full">
    <div className="flex flex-col items-center">
      <AIChatIcon />
      <p className="font-body text-sm text-ink-300 dark:text-ink-400 text-center max-w-[12rem] mt-5">
        Search any data type across multiple blockchains
      </p>
    </div>
    <ExamplePrompts onSelect={onSelectPrompt} />
  </div>
);

// ── Loading bubble ──────────────────────────────────────────────────────────

const LoadingBubble: React.FC = () => (
  <div className="flex justify-start">
    <div className="bg-[#F1F3F4] dark:bg-[#121417] text-ink-500 dark:text-ink-400 px-4 py-3 rounded-2xl text-sm flex gap-1 items-center">
      <span className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-bounce [animation-delay:0ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-bounce [animation-delay:150ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-bounce [animation-delay:300ms]" />
    </div>
  </div>
);

// ── Main MiniChat ───────────────────────────────────────────────────────────

interface MiniChatProps {
  visible: boolean;
  onClose?: () => void;
  // Passed down from the notebook page
  yDoc: Y.Doc;
  dataSources?: APIDataSources;
  dataframes?: string[];
}

export const MiniChat: React.FC<MiniChatProps> = ({
  visible,
  onClose,
  yDoc,
  dataSources,
  dataframes,
}) => {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Normalise dataSources into the shape the API expects
  const normalizedSources = dataSources
    ? Object.values(dataSources).map(ds => ({
        id: ds.config.data.id,
        name: ds.config.data.name,
        type: ds.config.data.type,
      }))
    : [];

  const { generate } = useNotebookAI({
    yDoc,
    dataSources: normalizedSources,
    dataframes,
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle prompt from URL search param
  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt && messages.length === 0) {
      void handleSend(prompt);
    }
  }, [searchParams]);

  const addMessage = (msg: Omit<Message, "id">) => {
    const id = crypto.randomUUID();
    setMessages(prev => [...prev, { ...msg, id }]);
    return id;
  };

  const replaceMessage = (id: string, update: Partial<Message>) => {
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, ...update } : m)));
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    addMessage({ text, isUser: true });
    setIsLoading(true);

    // Placeholder loading bubble
    const loadingId = addMessage({ text: "", isUser: false, isLoading: true });

    try {
      const { reply } = await generate(text);
      replaceMessage(loadingId, { text: reply, isLoading: false });
    } catch (err) {
      replaceMessage(loadingId, {
        text: "Something went wrong. Please try again.",
        isLoading: false,
      });
      console.error("[MiniChat] AI error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputSend = (data: { message: string; files: File[] }) => {
    void handleSend(data.message);
  };

  return (
    <Transition
      as="div"
      show={visible}
      className="h-full overflow-hidden flex-shrink-0 font-body"
      enter="transition-[width] duration-300 ease-in-out"
      enterFrom="w-0"
      enterTo="w-[354px]"
      leave="transition-[width] duration-300 ease-in-out"
      leaveFrom="w-[354px]"
      leaveTo="w-0"
    >
      <div className="relative w-[354px] flex flex-col overflow-y-auto border-l dark:border-border-tertiary border-border-secondary h-full bg-white dark:bg-base-100">
        <MiniChatHeader onCancel={onClose} />

        <div className="flex-1 overflow-y-auto py-6 px-4">
          {messages.length === 0 ? (
            <MiniChatEmptyState
              onSelectPrompt={text => void handleSend(text)}
            />
          ) : (
            <div className="flex flex-col w-full gap-4">
              {messages.map(msg =>
                msg.isLoading ? (
                  <LoadingBubble key={msg.id} />
                ) : (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`${
                        msg.isUser
                          ? "bg-[#DEFCFE] dark:bg-[#121417]"
                          : "bg-[#F1F3F4] dark:bg-[#121417]"
                      } text-ink-500 dark:text-ink-400 px-4 py-2 rounded-2xl max-w-[75%] text-sm`}
                    >
                      {msg.text}
                    </div>
                  </div>
                )
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="pb-4 md:px-4">
          <MiniChatInput onSend={handleInputSend} disabled={isLoading} />
        </div>
      </div>
    </Transition>
  );
};
