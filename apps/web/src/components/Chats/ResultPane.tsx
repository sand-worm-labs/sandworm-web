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
