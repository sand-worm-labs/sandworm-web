import React from "react";

import type { IconProps } from "./Menu/types";

export const QuestionIcon: React.FC<IconProps> = ({ size , className }) => {
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
        d="M8 11C8.13807 11 8.25 11.1119 8.25 11.25C8.25 11.3881 8.13807 11.5 8 11.5C7.86193 11.5 7.75 11.3881 7.75 11.25C7.75 11.1119 7.86193 11 8 11Z"
        fill="#1C3B5A"
        stroke="#1C3B5A"
      />
      <path
        d="M8 9V8.5C9.10438 8.5 10 7.71625 10 6.75C10 5.78375 9.10438 5 8 5C6.89562 5 6 5.78375 6 6.75V7"
        stroke="#1C3B5A"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
        stroke="#1C3B5A"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
