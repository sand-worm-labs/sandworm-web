import React from "react";

import type { IconProps } from "./Menu/types";

export const ThumbsUpIcon: React.FC<IconProps> = ({ size = 16, className }) => {
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
        d="M2 6.5H5V13H2C1.86739 13 1.74021 12.9473 1.64645 12.8536C1.55268 12.7598 1.5 12.6326 1.5 12.5V7C1.5 6.86739 1.55268 6.74021 1.64645 6.64645C1.74021 6.55268 1.86739 6.5 2 6.5Z"
        stroke="#1C3B5A"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 6.5L7.5 1.5C8.03043 1.5 8.53914 1.71071 8.91421 2.08579C9.28929 2.46086 9.5 2.96957 9.5 3.5V5H13.5C13.6419 5.00004 13.7821 5.03026 13.9113 5.08865C14.0406 5.14704 14.156 5.23227 14.2498 5.33867C14.3436 5.44507 14.4137 5.57021 14.4555 5.70579C14.4972 5.84136 14.5096 5.98426 14.4919 6.125L13.7419 12.125C13.7114 12.3666 13.5939 12.5888 13.4113 12.7499C13.2286 12.911 12.9935 12.9999 12.75 13H5"
        stroke="#1C3B5A"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
