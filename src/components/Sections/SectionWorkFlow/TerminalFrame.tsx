import React from "react";

export const TerminalFrame = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative border-[0.5px] border-[#404040]  rounded-lg">
      <div className="py-2.5 px-3 border-b border-[#404040]">
        <div className="flex space-x-3">
          <div className="bg-[#ff5f56] w-3 h-3 rounded-full opacity-70" />
          <div className="bg-[#ffbd2e] w-3 h-3 rounded-full opacity-70" />
          <div className="bg-[#27c93f] w-3 h-3 rounded-full opacity-70" />
        </div>
      </div>
      <div className="p-4 bg-[#ffffff10] ">{children}</div>
    </div>
  );
};
