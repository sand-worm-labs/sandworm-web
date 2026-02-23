import React from "react";

import type { IconProps } from "../Menu/types";

export const TextIcon: React.FC<IconProps> = ({ className, size = 16 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M8 3.5V12.5"
        stroke="#868E96"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 5.5V3.5H12.5V5.5"
        stroke="#868E96"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 12.5H10"
        stroke="#868E96"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
