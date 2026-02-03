import React from "react";
import type { IconProps } from "./Menu/types";

export const Share: React.FC<IconProps> = ({
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
        d="M10.4834 5.1543L6.39258 7.78398"
        stroke={color}    
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.39258 10.2168L10.4834 12.8465"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 11.25C5.74264 11.25 6.75 10.2426 6.75 9C6.75 7.75736 5.74264 6.75 4.5 6.75C3.25736 6.75 2.25 7.75736 2.25 9C2.25 10.2426 3.25736 11.25 4.5 11.25Z"
        stroke="#343330"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.375 16.3125C13.6176 16.3125 14.625 15.3051 14.625 14.0625C14.625 12.8199 13.6176 11.8125 12.375 11.8125C11.1324 11.8125 10.125 12.8199 10.125 14.0625C10.125 15.3051 11.1324 16.3125 12.375 16.3125Z"
        stroke="#343330"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.375 6.1875C13.6176 6.1875 14.625 5.18014 14.625 3.9375C14.625 2.69486 13.6176 1.6875 12.375 1.6875C11.1324 1.6875 10.125 2.69486 10.125 3.9375C10.125 5.18014 11.1324 6.1875 12.375 6.1875Z"
        stroke="#343330"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
