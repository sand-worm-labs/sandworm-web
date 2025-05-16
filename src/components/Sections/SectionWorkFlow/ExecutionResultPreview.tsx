"use client";

import type { FC } from "react";
import clsx from "clsx";

const fakeData = [
  ["0xabc...123", "42", "15.7", "Success", "2025-05-16"],
  ["0xdef...456", "88", "3.14", "Failed", "2025-05-15"],
  ["0xghi...789", "69", "9.81", "Pending", "2025-05-14"],
  ["0xjkl...000", "1337", "1.618", "Success", "2025-05-13"],
];

export const ExecutionResultPreview: FC = () => {
  return (
    <div className="w-full mx-auto bg-[#0B0B0F] border border-[#222] rounded-none overflow-hidden shadow-xl">
      <div className="grid grid-cols-5">
        {["Address", "Tx Count", "Amount", "Status", "Date"].map(
          (header, i) => (
            <div
              key={i}
              className="px-4 py-2 text-xs font-medium uppercase text-[#BBB] bg-[#141418] border-b border-[#222]"
            >
              {header}
            </div>
          )
        )}
        {fakeData.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className={clsx(
                "px-4 py-2.5 text-xs text-[#E0E0E0] border-b border-[#222] transition-all duration-200 cursor-pointer group border-l flex items-center justify-center text-center ",
                "hover:bg-white/10 "
              )}
            >
              <span className="transition-all duration-300 group-hover:bg-white/10 border-r">
                {cell}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
