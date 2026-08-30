import React from "react";

import type { IconProps } from "./Menu/types";

export const User: React.FC<IconProps> = ({ size = 188, className }) => {
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
        d="M5.25 10C7.04493 10 8.5 8.54493 8.5 6.75C8.5 4.95507 7.04493 3.5 5.25 3.5C3.45507 3.5 2 4.95507 2 6.75C2 8.54493 3.45507 10 5.25 10Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.639648 12.5003C1.13908 11.7324 1.8224 11.1014 2.62756 10.6646C3.43273 10.2278 4.33425 9.99902 5.25027 9.99902C6.1663 9.99902 7.06782 10.2278 7.87298 10.6646C8.67815 11.1014 9.36147 11.7324 9.8609 12.5003"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.75 10C11.666 9.99946 12.5676 10.2279 13.3728 10.6645C14.178 11.1011 14.8613 11.7321 15.3606 12.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.54297 3.73125C9.98754 3.55393 10.4658 3.477 10.9435 3.50595C11.4213 3.5349 11.8868 3.66901 12.3067 3.89871C12.7266 4.1284 13.0906 4.44801 13.3726 4.83469C13.6547 5.22138 13.8479 5.66559 13.9384 6.13559C14.0289 6.60558 14.0144 7.08977 13.8961 7.55353C13.7777 8.0173 13.5584 8.44921 13.2538 8.81839C12.9492 9.18758 12.5668 9.48492 12.134 9.68918C11.7011 9.89344 11.2285 9.99958 10.7498 10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
