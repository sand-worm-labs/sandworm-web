"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Transition } from "@headlessui/react";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";

import { AIChatIcon } from "../Assets/AIChatIcon";

import { MiniChatInput } from "./MiniChatInput";

interface MiniChatHeaderProps {
  onCancel?: () => void;
}

export const MiniChatHeader: React.FC<MiniChatHeaderProps> = ({ onCancel }) => {
  return (
    <header className="flex items-center justify-between  bg-white dark:bg-base-100  border-b border-border-secondary border-dashed dark:border-border-secondary ">
      <div className="flex-col flex">
        <h3 className="text-lg font-medium leading-6 dark:text-white text-ink-100 px-4 pt-6 xl:px-6 ">
          Sandworm agent
        </h3>

        <p className="text-sm text-ink-400 px-4 mb-4  xl:px-6 ">
          Create deep and insightful analysis
        </p>
      </div>

      <button
        type="button"
        aria-label="Cancel chat"
        onClick={() => (onCancel ? onCancel() : console.log("cancel"))}
        className="absolute z-10 top-7 transform rounded-full border border-gray-300  text-ink-400 bg-base-100 hover:bg-gray-100 w-6 h-6 flex justify-center items-center right-3 -translate-x-1/2 dark:border-border-tertiary "
      >
        <ChevronDoubleRightIcon className="w-3 h-3" />
      </button>
    </header>
  );
};

// ── Example prompt cards ────────────────────────────────────────────────────

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

const ExamplePrompts: React.FC<ExamplePromptsProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col gap-2 w-full mt-6">
      {EXAMPLE_PROMPTS.map(item => (
        <button
          key={item.label}
          type="button"
          onClick={() => onSelect(item.prompt)}
          className="group flex items-start gap-3 w-full text-left px-4 py-2.5 rounded-xl border border-border-secondary dark:border-border-tertiary bg-white dark:bg-base-200 hover:border-primary/40 dark:hover:border-primary/40 hover:bg-primary/[0.03] dark:hover:bg-primary/[0.06] transition-all duration-150"
        >
        

          <span className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold text-ink-100   mb-0.5">
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
};

// ── Empty state ─────────────────────────────────────────────────────────────

interface MiniChatEmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export const MiniChatEmptyState: React.FC<MiniChatEmptyStateProps> = ({
  onSelectPrompt,
}) => {
  return (
    <div className="flex flex-col items-center py-8 font-body  justify-end h-full">
      <div className="flex flex-col items-center">
        <AIChatIcon />
        <p className="font-body text-sm text-ink-300 dark:text-ink-400 text-center max-w-[12rem] mt-5">
          Search any data type across multiple blockchains
        </p>
      </div>

      <ExamplePrompts onSelect={onSelectPrompt} />
    </div>
  );
};

// ── Main MiniChat ───────────────────────────────────────────────────────────

interface MiniChatProps {
  visible: boolean;
  onClose?: () => void;
}

export const MiniChat: React.FC<MiniChatProps> = ({ visible, onClose }) => {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<
    Array<{ text: string; isUser: boolean }>
  >([]);

  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt && messages.length === 0) {
      setMessages([{ text: prompt, isUser: true }]);

      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            text: "I've analyzed the blockchain data you requested. Here's what I found...",
            isUser: false,
          },
        ]);
      }, 800);
    }
  }, [searchParams]);

  const handleSendMessage = (data: { message: string; files: File[] }) => {
    if (!data.message.trim()) return;

    setMessages(prev => [...prev, { text: data.message, isUser: true }]);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          text: "I've analyzed the blockchain data you requested. Here's what I found...",
          isUser: false,
        },
      ]);
    }, 800);
  };

  const handleExamplePrompt = (prompt: string) => {
    handleSendMessage({ message: prompt, files: [] });
  };

  return (
    <Transition
      as="div"
      show={visible}
      className="h-full overflow-hidden flex-shrink-0 font-body "
      enter="transition-[width] duration-300 ease-in-out"
      enterFrom="w-0"
      enterTo="w-[354px]"
      leave="transition-[width] duration-300 ease-in-out"
      leaveFrom="w-[354px]"
      leaveTo="w-0"
    >
      <div className=" relative w-[354px] flex flex-col overflow-y-auto border-l dark:border-border-tertiary border-border-secondary h-full bg-white dark:bg-base-100  ">
        <MiniChatHeader onCancel={onClose} />

        <div className="flex-1 overflow-y-auto py-6 px-4 ">
          {messages.length === 0 ? (
            <MiniChatEmptyState onSelectPrompt={handleExamplePrompt} />
          ) : (
            <div className="flex flex-col w-full gap-4">
              {messages.map(msg => (
                <div
                  key={msg.text}
                  className={`flex ${
                    msg.isUser ? "justify-end" : "justify-start"
                  }`}
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
              ))}
            </div>
          )}
        </div>

        <div className="pb-4 md:px-4">
          <MiniChatInput onSend={handleSendMessage} />
        </div>
      </div>
    </Transition>
  );
};
