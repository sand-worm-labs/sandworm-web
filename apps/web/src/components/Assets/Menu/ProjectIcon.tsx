import React from "react";
import type { IconProps } from "./types";

export const ProjectIcon: React.FC<IconProps> = ({
  size = 16,
  className,
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
        d="M14 4.5H2C1.72386 4.5 1.5 4.72386 1.5 5V12C1.5 12.2761 1.72386 12.5 2 12.5H14C14.2761 12.5 14.5 12.2761 14.5 12V5C14.5 4.72386 14.2761 4.5 14 4.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.5 7.5H14.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 6.5V8.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 6.5V8.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 4.5V3.5C10.5 3.23478 10.3946 2.98043 10.2071 2.79289C10.0196 2.60536 9.76522 2.5 9.5 2.5H6.5C6.23478 2.5 5.98043 2.60536 5.79289 2.79289C5.60536 2.98043 5.5 3.23478 5.5 3.5V4.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
