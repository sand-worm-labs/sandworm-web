import React from "react";

import type { IconProps } from "../Menu/types";

export const KeyboardIcon: React.FC<IconProps> = ({ className, size = 16 }) => {
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
        d="M14 3.5H2C1.72386 3.5 1.5 3.72386 1.5 4V12C1.5 12.2761 1.72386 12.5 2 12.5H14C14.2761 12.5 14.5 12.2761 14.5 12V4C14.5 3.72386 14.2761 3.5 14 3.5Z"
        stroke="#868E96"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 8H12.5"
        stroke="#868E96"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 6H12.5"
        stroke="#868E96"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 10H4"
        stroke="#868E96"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 10H10"
        stroke="#868E96"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 10H12.5"
        stroke="#868E96"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
