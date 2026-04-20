import React from "react";

import type { IconProps } from "./Menu/types";


export const Copy: React.FC<IconProps> = ({ size = 16, className }) => {
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
        d="M10.5 10.5H13.5V2.5H5.5V5.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 5.5H2.5V13.5H10.5V5.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
