"use client";

import React from "react";

import { MiniChatInput } from "./MiniChatInput";

export const MiniChat = () => {
  return (
    <div className="flex flex-col h-[94%] w-full md:max-w-[800px] max-w-[calc(100dvw-32px)] px-4 md:px-6 mx-auto border-l dark:border-[#262A30] border-[#E9ECEF] text-sm">
      {/* Messages scrollable area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
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
              <div className="text-sm font-medium mb-2 text-[#0F0F0F]">
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

      {/* Input stays at bottom */}
      <div className="pb-6">
        <MiniChatInput />
      </div>
    </div>
  );
};
