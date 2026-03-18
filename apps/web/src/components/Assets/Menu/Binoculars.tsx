import React from "react";

import type { IconProps } from "./types";

export const Binoculars: React.FC<IconProps> = ({ size = 16, className }) => {
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
        d="M6.5 5.5H9.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.3494 9.64485L11.6213 3.43735C11.3399 3.15607 10.9584 2.99805 10.5606 2.99805C10.1628 2.99805 9.7813 3.15607 9.5 3.43735V10.4999"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.50172 10.4999V3.43735C6.22042 3.15607 5.8389 2.99805 5.44109 2.99805C5.04329 2.99805 4.66177 3.15607 4.38047 3.43735L1.65234 9.64485"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 13C5.38071 13 6.5 11.8807 6.5 10.5C6.5 9.11929 5.38071 8 4 8C2.61929 8 1.5 9.11929 1.5 10.5C1.5 11.8807 2.61929 13 4 13Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 13C13.3807 13 14.5 11.8807 14.5 10.5C14.5 9.11929 13.3807 8 12 8C10.6193 8 9.5 9.11929 9.5 10.5C9.5 11.8807 10.6193 13 12 13Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
