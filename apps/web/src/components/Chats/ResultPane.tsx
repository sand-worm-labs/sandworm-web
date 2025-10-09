"use client";

import React from "react";

interface ResultPaneProps {
  children?: React.ReactNode;
  isLoading?: boolean;
}

export const ResultPane: React.FC<ResultPaneProps> = ({
  children,
  isLoading,
}) => {
  return (
    <div className="w-full h-full flex flex-col  overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#E9ECEF] ">
        <h2 className="text-sm font-medium text-neutral-300">Result Pane</h2>
        <span className="text-xs text-neutral-500">
          {isLoading ? "Generating..." : "Ready"}
        </span>
      </div>

      <div className="flex-1 overflow-auto p-4 text-neutral-200  text-sm">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-neutral-500">
            <span className="animate-pulse">Generating</span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
