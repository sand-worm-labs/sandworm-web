"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Transition } from "@headlessui/react";

import ScrollBar from "../Visualization/blocks/ScrollBar";

import { MiniChatInput } from "./MiniChatInput";

interface MiniChatHeaderProps {
  onCancel?: () => void;
}

export const MiniChatHeader: React.FC<MiniChatHeaderProps> = ({ onCancel }) => {
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white dark:bg-black border-b border-gray-200 dark:border-slate-800 ">
      <h3 className="text-sm font-medium leading-5 text-slate-900 dark:text-slate-100">
        Sandworm agent
      </h3>

      <button
        type="button"
        aria-label="Cancel chat"
        onClick={() => (onCancel ? onCancel() : console.log("cancel"))}
        className="inline-flex items-center justify-center rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95A1 1 0 013.636 14.95L8.586 10 3.636 5.05A1 1 0 015.05 3.636L10 8.586z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </header>
  );
};

export const MiniChatEmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12 font-primary relative">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, #E2E8F0 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          backgroundPosition: "center center",
        }}
      />

      <div
        className="absolute inset-0 [--gradient-color:white] dark:[--gradient-color:oklch(0.145_0_0)]"
        style={{
          background:
            "radial-gradient(ellipse 80% 120% at 50% 50%, transparent 0%, var(--gradient-color) 70%)",
        }}
      />

      <div className="flex flex-col items-center relative z-10">
        <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-slate-100 dark:bg-slate-800">
          <svg
            className="w-8 h-8 text-slate-600 dark:text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>

        <h2 className="text-base font-meduim text-slate-900 dark:text-slate-100 mb-2 text-center">
          What do you want to explore?
        </h2>

        <p className="text-sm text-slate-600 dark:text-slate-400 text-center max-w-md">
          Ask questions about blockchain data, explore token metrics, visualize
          on-chain analytics, or dive into DeFi protocols
        </p>
      </div>
    </div>
  );
};

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

  return (
    <Transition
      as="div"
      show={visible}
      className="top-0 right-0 h-full absolute z-30 font-primary"
      enter="transition ease-in-out duration-300 transform"
      enterFrom="translate-x-full"
      enterTo="translate-x-0"
      leave="transition ease-in-out duration-300 transform"
      leaveFrom="translate-x-0"
      leaveTo="transform translate-x-full"
    >
      <div className="w-[324px] flex flex-col overflow-y-auto border-l dark:border-[#262A30] border-gray-200 h-full bg-white dark:bg-black ">
        <MiniChatHeader onCancel={onClose} />

        <div className="flex-1 overflow-y-auto py-6 px-4">
          {messages.length === 0 ? (
            <MiniChatEmptyState />
          ) : (
            <div className="flex flex-col w-full gap-4">
              {messages.map(msg => (
                <div
                  key={msg.text}
                  className={`flex ${msg.isUser ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`${msg.isUser
                        ? "bg-[#F7E4E1] dark:bg-[#121417]"
                        : "bg-[#F1F3F4] dark:bg-[#121417]"
                      } text-[#343A40] dark:text-[#8696A6] px-4 py-2 rounded-2xl max-w-[75%]`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pb-6 md:px-4">
          <MiniChatInput onSend={handleSendMessage} />
        </div>
      </div>
    </Transition>
  );
};
