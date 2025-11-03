import React from "react";
import { IconProps } from "@/types";

export const Binocular = ({
  width = 20,
  height = 20,
  className,
}: IconProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M8.125 6.875H11.875"
        stroke="#C5CED9"
        stroke-width="1.25"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M17.9367 12.0563L14.5266 4.29693C14.1749 3.94533 13.698 3.7478 13.2008 3.7478C12.7035 3.7478 12.2266 3.94533 11.875 4.29693V13.1251"
        stroke="#C5CED9"
        stroke-width="1.25"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M8.12422 13.1251V4.29693C7.77259 3.94533 7.2957 3.7478 6.79844 3.7478C6.30118 3.7478 5.82428 3.94533 5.47266 4.29693L2.0625 12.0563"
        stroke="#C5CED9"
        stroke-width="1.25"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M5 16.25C6.72589 16.25 8.125 14.8509 8.125 13.125C8.125 11.3991 6.72589 10 5 10C3.27411 10 1.875 11.3991 1.875 13.125C1.875 14.8509 3.27411 16.25 5 16.25Z"
        stroke="#C5CED9"
        stroke-width="1.25"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M15 16.25C16.7259 16.25 18.125 14.8509 18.125 13.125C18.125 11.3991 16.7259 10 15 10C13.2741 10 11.875 11.3991 11.875 13.125C11.875 14.8509 13.2741 16.25 15 16.25Z"
        stroke="#C5CED9"
        stroke-width="1.25"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};
