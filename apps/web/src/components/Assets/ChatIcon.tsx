import React from "react";

import type { IconProps } from "./Menu/types";

export const ChatIcon: React.FC<IconProps> = ({
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
        d="M6.75 7.3125H11.25"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.75 9.5625H11.25"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.38773 13.5L8.51273 15.4688C8.56189 15.555 8.633 15.6267 8.71882 15.6765C8.80465 15.7264 8.90214 15.7527 9.00141 15.7527C9.10067 15.7527 9.19816 15.7264 9.28399 15.6765C9.36982 15.6267 9.44092 15.555 9.49008 15.4688L10.6151 13.5H15.1875C15.3367 13.5 15.4798 13.4407 15.5852 13.3352C15.6907 13.2298 15.75 13.0867 15.75 12.9375V3.9375C15.75 3.78832 15.6907 3.64524 15.5852 3.53975C15.4798 3.43426 15.3367 3.375 15.1875 3.375H2.8125C2.66332 3.375 2.52024 3.43426 2.41475 3.53975C2.30926 3.64524 2.25 3.78832 2.25 3.9375V12.9375C2.25 13.0867 2.30926 13.2298 2.41475 13.3352C2.52024 13.4407 2.66332 13.5 2.8125 13.5H7.38773Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
