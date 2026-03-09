import React from "react";

import type { IconProps } from "../Menu/types";

export const CubeIcon: React.FC<IconProps> = ({ className, size = 16 }) => {
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
        d="M2.04297 4.80762L7.99922 8.06762L13.9555 4.80762"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.24 1.56234L13.74 4.57359C13.8185 4.61656 13.8841 4.67983 13.9298 4.75679C13.9756 4.83375 13.9998 4.92157 14 5.01109V10.9886C13.9998 11.0781 13.9756 11.1659 13.9298 11.2429C13.8841 11.3199 13.8185 11.3831 13.74 11.4261L8.24 14.4373C8.16641 14.4776 8.08388 14.4987 8 14.4987C7.91612 14.4987 7.83359 14.4776 7.76 14.4373L2.26 11.4261C2.18147 11.3831 2.11591 11.3199 2.07017 11.2429C2.02444 11.1659 2.0002 11.0781 2 10.9886V5.01109C2.0002 4.92157 2.02444 4.83375 2.07017 4.75679C2.11591 4.67983 2.18147 4.61656 2.26 4.57359L7.76 1.56234C7.83359 1.52208 7.91612 1.50098 8 1.50098C8.08388 1.50098 8.16641 1.52208 8.24 1.56234Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 8.06836V14.5002"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
