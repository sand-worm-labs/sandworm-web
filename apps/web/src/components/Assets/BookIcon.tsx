import React from "react";

import type { IconProps } from "./Menu/types";

export const BookIcon: React.FC<IconProps> = ({ size, className }) => {
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
        d="M3 13.5C3 13.1022 3.15804 12.7206 3.43934 12.4393C3.72064 12.158 4.10218 12 4.5 12H13V2H4.5C4.10218 2 3.72064 2.15804 3.43934 2.43934C3.15804 2.72064 3 3.10218 3 3.5V13.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 13.5V14H12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
