import React from "react";

import type { IconProps } from "../Menu/types";

export const DatabaseIcon: React.FC<IconProps> = ({ className, size = 16 }) => {
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
        d="M8 8C11.0376 8 13.5 6.65685 13.5 5C13.5 3.34315 11.0376 2 8 2C4.96243 2 2.5 3.34315 2.5 5C2.5 6.65685 4.96243 8 8 8Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 5V8C2.5 9.65688 4.9625 11 8 11C11.0375 11 13.5 9.65688 13.5 8V5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 8V11C2.5 12.6569 4.9625 14 8 14C11.0375 14 13.5 12.6569 13.5 11V8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
