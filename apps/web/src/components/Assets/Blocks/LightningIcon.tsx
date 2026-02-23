import React from "react";

import type { IconProps } from "../Menu/types";

export const LightningIcon: React.FC<IconProps> = ({
  className,
  size = 16,
}) => {
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
        d="M10 1L9 6L13 7.5L6 15L7 10L3 8.5L10 1Z"
        stroke="#A308F0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
