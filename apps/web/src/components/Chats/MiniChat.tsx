"use client";

import React from "react";

import { MiniChatInput } from "./MiniChatInput";

interface MiniChatHeaderProps {
  onCancel?: () => void;
}

export const MiniChatHeader: React.FC<MiniChatHeaderProps> = ({ onCancel }) => {
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white dark:bg-black border-b border-gray-200 dark:border-slate-800">
      <h3 className="text-sm font-semibold leading-5 text-slate-900 dark:text-slate-100">
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

export const MiniChat = () => {
  return (
    <div className="flex flex-col h-[94%] w-full md:max-w-[800px] max-w-[calc(100dvw-32px)]  md:px-0 mx-auto border-l dark:border-[#262A30] border-[#E9ECEF] text-sm">
      <MiniChatHeader />
      <div className="flex-1 overflow-y-auto py-6 space-y-6 px-4">
        <div className="flex flex-col w-full gap-4">
          <div className="flex justify-end">
            <div className="bg-[#F7E4E1] text-[#343A40] dark:bg-[#121417] px-4 py-2 rounded-2xl max-w-[75%] dark:text-[#8696A6]">
              Create a bar chart with tokens above $1m market cap on Base.
            </div>
          </div>

          <div className="flex justify-start flex-col mt-5">
            <div className="max-w-[80%] text-[#343A40] dark:text-white mb-3">
              Here’s a bar chart on the different tokens above $1m market cap on
              Base.
            </div>
            <div className="bg-[#F1F3F4] text-[#343A40] px-4 py-2 rounded-2xl max-w-[75%] dark:text-[#8696A6] dark:bg-[#121417]">
              <div className="text-sm font-medium mb-2 text-[#0F0F0F] dark:text-white">
                Chart
              </div>
              Here’s a bar chart on the different tokens above $1m market cap on
              Base.
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <div className="bg-[#F7E4E1] text-[#343A40] px-4 py-2 rounded-2xl max-w-[75%] dark:text-[#8696A6] dark:bg-[#121417]">
              Ohhh that’s clean. So like Dune but cooler?
            </div>
          </div>

          <div className="flex justify-start">
            <div className="bg-[#F1F3F4] text-[#343A40] px-4 py-2 rounded-2xl max-w-[75%] dark:text-[#8696A6] dark:bg-[#121417]">
              Here’s a bar chart on the different tokens above $1m market cap on
              Base.
            </div>
          </div>
        </div>
      </div>

      <div className="pb-6 md:px-4">
        <MiniChatInput />
      </div>
    </div>
  );
};
