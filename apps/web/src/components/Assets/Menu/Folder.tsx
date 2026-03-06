import React from "react";

import type { IconProps } from "./types";

export const Folder: React.FC<IconProps> = ({
  size = 12,
  className,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10.1667 9.75H1.84594C1.75427 9.74975 1.66642 9.71323 1.6016 9.6484C1.53677 9.58358 1.50025 9.49573 1.5 9.40406V3.75H10.125C10.2245 3.75 10.3198 3.78951 10.3902 3.85984C10.4605 3.93016 10.5 4.02554 10.5 4.125V9.41672C10.5 9.50511 10.4649 9.58988 10.4024 9.65238C10.3399 9.71489 10.2551 9.75 10.1667 9.75Z"
        stroke="currentColor"
        strokeWidth="0.857143"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.5 3.75V2.625C1.5 2.52554 1.53951 2.43016 1.60984 2.35984C1.68016 2.28951 1.77554 2.25 1.875 2.25H4.34484C4.44417 2.25005 4.53942 2.28949 4.60969 2.35969L6 3.75"
        stroke="currentColor"
        strokeWidth="0.5625"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
