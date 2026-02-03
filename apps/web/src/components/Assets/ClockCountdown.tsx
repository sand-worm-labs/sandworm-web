import React from "react";
import type { IconProps } from "./Menu/types";

export const ClockCountdown: React.FC<IconProps> = ({
  size = 18,
  color = "#1C3B5A",
  className,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M15.75 9.5625C15.4638 13.0275 12.5388 15.75 9 15.75C7.20979 15.75 5.4929 15.0388 4.22703 13.773C2.96116 12.5071 2.25 10.7902 2.25 9C2.25 5.46117 4.9725 2.53617 8.4375 2.25"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 5.0625V9H12.9375"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.25 3.23438C11.6383 3.23438 11.9531 2.91958 11.9531 2.53125C11.9531 2.14292 11.6383 1.82812 11.25 1.82812C10.8617 1.82812 10.5469 2.14292 10.5469 2.53125C10.5469 2.91958 10.8617 3.23438 11.25 3.23438Z"
        fill={color}
      />
      <path
        d="M13.7812 4.92188C14.1696 4.92188 14.4844 4.60708 14.4844 4.21875C14.4844 3.83042 14.1696 3.51562 13.7812 3.51562C13.3929 3.51562 13.0781 3.83042 13.0781 4.21875C13.0781 4.60708 13.3929 4.92188 13.7812 4.92188Z"
        fill={color}
      />
      <path
        d="M15.4688 7.45312C15.8571 7.45312 16.1719 7.13833 16.1719 6.75C16.1719 6.36167 15.8571 6.04688 15.4688 6.04688C15.0804 6.04688 14.7656 6.36167 14.7656 6.75C14.7656 7.13833 15.0804 7.45312 15.4688 7.45312Z"
        fill={color}
      />
    </svg>
  );
};
