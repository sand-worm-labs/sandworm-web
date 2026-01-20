import React from "react";
import type { IconProps } from "./types";

export const House: React.FC<IconProps> = ({
  size = 16,
  color = "#A308F0",
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
        d="M6.5 13.5004V9.50039H9.5V13.5004H13.5V7.50039C13.5001 7.43471 13.4872 7.36967 13.4621 7.30897C13.437 7.24827 13.4002 7.19311 13.3538 7.14664L8.35375 2.14664C8.30731 2.10016 8.25217 2.06328 8.19147 2.03811C8.13077 2.01295 8.06571 2 8 2C7.93429 2 7.86923 2.01295 7.80853 2.03811C7.74783 2.06328 7.69269 2.10016 7.64625 2.14664L2.64625 7.14664C2.59983 7.19311 2.56303 7.24827 2.53793 7.30897C2.51284 7.36967 2.49995 7.43471 2.5 7.50039V13.5004H6.5Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
