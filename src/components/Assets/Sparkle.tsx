import React from "react";

export const SparkleIcon = ({
  width = "18",
  height = "18",
}: {
  width?: string;
  height?: string;
}) => {
  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.92506 12.0748L2.05154 10.6474C1.94473 10.608 1.85258 10.5368 1.78749 10.4434C1.7224 10.35 1.6875 10.2389 1.6875 10.125C1.6875 10.0112 1.7224 9.90004 1.78749 9.80663C1.85258 9.71322 1.94473 9.64201 2.05154 9.60258L5.92506 8.17524L7.3524 4.30172C7.39182 4.19492 7.46304 4.10276 7.55645 4.03767C7.64986 3.97258 7.76097 3.93768 7.87482 3.93768C7.98867 3.93768 8.09979 3.97258 8.1932 4.03767C8.28661 4.10276 8.35782 4.19492 8.39724 4.30172L9.82459 8.17524L13.6981 9.60258C13.8049 9.64201 13.8971 9.71322 13.9622 9.80663C14.0272 9.90004 14.0621 10.0112 14.0621 10.125C14.0621 10.2389 14.0272 10.35 13.9622 10.4434C13.8971 10.5368 13.8049 10.608 13.6981 10.6474L9.82459 12.0748L8.39724 15.9483C8.35782 16.0551 8.28661 16.1473 8.1932 16.2123C8.09979 16.2774 7.98867 16.3123 7.87482 16.3123C7.76097 16.3123 7.64986 16.2774 7.55645 16.2123C7.46304 16.1473 7.39182 16.0551 7.3524 15.9483L5.92506 12.0748Z"
        fill="#6C00FF"
        stroke="#6C00FF"
        strokeWidth="1.125"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.375 1.125V4.5"
        stroke="#1200FF"
        strokeWidth="1.125"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.75 5.0625V7.3125"
        stroke="#1200FF"
        strokeWidth="1.125"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.6875 2.8125H14.0625"
        stroke="#1200FF"
        strokeWidth="1.125"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.625 6.1875H16.875"
        stroke="#1200FF"
        strokeWidth="1.125"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
