import React from "react";

export const Star = ({
  width = "40",
  height = "40",
}: {
  width?: string;
  height?: string;
}) => {
  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_i_192_1425)">
        <path
          d="M19.5938 3.27466C19.7594 2.93665 20.2406 2.93665 20.4062 3.27466L24.6152 11.8596C25.275 13.2055 26.5581 14.1382 28.042 14.3499L37.5078 15.6995C37.8804 15.7526 38.0298 16.2108 37.7598 16.4729L30.8945 23.1292C29.8186 24.1725 29.3286 25.6809 29.5859 27.1575L31.2275 36.5764C31.2922 36.9473 30.902 37.2309 30.5693 37.0549L22.1182 32.5833C20.7933 31.8822 19.2067 31.8822 17.8818 32.5833L9.43066 37.0549C9.09795 37.2309 8.70784 36.9472 8.77246 36.5764L10.4141 27.1575C10.6714 25.6809 10.1814 24.1726 9.10547 23.1292L2.24023 16.4729C1.97018 16.2108 2.11959 15.7526 2.49219 15.6995L11.958 14.3499C13.4419 14.1382 14.725 13.2055 15.3848 11.8596L19.5938 3.27466Z"
          stroke="url(#paint0_linear_192_1425)"
          strokeWidth="4.07547"
        />
      </g>
      <defs>
        <filter
          id="filter0_i_192_1425"
          x="0.0625"
          y="0.983154"
          width="39.875"
          height="39.9789"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1.81132" />
          <feGaussianBlur stdDeviation="0.90566" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.67 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_192_1425"
          />
        </filter>
        <linearGradient
          id="paint0_linear_192_1425"
          x1="-4.90909"
          y1="6.09871"
          x2="48.088"
          y2="14.0944"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6368FF" />
          <stop offset="0.153846" stopColor="#CBECFF" />
          <stop offset="0.25" stopColor="#7BFF42" />
          <stop offset="0.427885" stopColor="#2DB2FF" />
          <stop offset="0.610577" stopColor="#FF0000" />
          <stop offset="0.817308" stopColor="#DED757" />
          <stop offset="1" stopColor="#FF00E1" />
        </linearGradient>
      </defs>
    </svg>
  );
};
