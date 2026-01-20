import React from "react";
import type { IconProps } from "./types";

export const File: React.FC<IconProps> = ({
  size = 12,
  color = "#616A79",
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
        d="M9.375 10.5H2.625C2.52554 10.5 2.43016 10.4605 2.35984 10.3902C2.28951 10.3198 2.25 10.2245 2.25 10.125V1.875C2.25 1.77554 2.28951 1.68016 2.35984 1.60984C2.43016 1.53951 2.52554 1.5 2.625 1.5H7.125L9.75 4.125V10.125C9.75 10.2245 9.71049 10.3198 9.64017 10.3902C9.56984 10.4605 9.47446 10.5 9.375 10.5Z"
        stroke={color}
        strokeWidth="0.857143"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.125 1.5V4.125H9.75"
        stroke={color}
        strokeWidth="0.5625"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
