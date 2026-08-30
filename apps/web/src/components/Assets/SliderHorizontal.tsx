import React from "react";

import type { IconProps } from "./Menu/types";

export const SliderHorizontal: React.FC<IconProps> = ({
  size = 16,
  className,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.5 6.5C7.32843 6.5 8 5.82843 8 5C8 4.17157 7.32843 3.5 6.5 3.5C5.67157 3.5 5 4.17157 5 5C5 5.82843 5.67157 6.5 6.5 6.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 12.5C11.3284 12.5 12 11.8284 12 11C12 10.1716 11.3284 9.5 10.5 9.5C9.67157 9.5 9 10.1716 9 11C9 11.8284 9.67157 12.5 10.5 12.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 5H13.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 5H5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 11H13.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 11H9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
