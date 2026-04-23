import React from "react";

import type { IconProps } from "./Menu/types";

export const Desktop: React.FC<IconProps> = ({ size = 24, className }) => {
  return (
    <svg
      width={size}
      className={className}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 12L13 12C13.5523 12 14 11.5523 14 11L14 4C14 3.44771 13.5523 3 13 3L3 3C2.44771 3 2 3.44771 2 4L2 11C2 11.5523 2.44771 12 3 12Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 14H6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 9.5H14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 12V14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
