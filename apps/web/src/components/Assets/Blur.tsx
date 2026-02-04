import React from "react";

import type { IconProps } from "./Menu/types";

export const BlurRadar = () => {
  return (
    <svg
      width="622"
      height="674"
      viewBox="0 0 622 674"
      fill="none"
      className="w-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_f_radar)">
        <path
          d="M380.692 135.168L627.242 391V246.55L380.692 0L89.4722 226.826L-6.24744 82.3769L-2.76672 263.084L89.4722 391L380.692 135.168Z"
          fill="url(#paint0_linear_radar)"
        />
        <path
          d="M380.692 135.168L627.242 391V246.55L380.692 0L89.4722 226.826L-6.24744 82.3769L-2.76672 263.084L89.4722 391L380.692 135.168Z"
          stroke="black"
          strokeWidth="1.16024"
        />
      </g>
      <defs>
        <filter
          id="filter0_f_radar"
          x="-288.066"
          y="-281.973"
          width="1197.09"
          height="955.611"
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
          <feGaussianBlur
            stdDeviation="140.6"
            result="effect1_foregroundBlur_radar"
          />
        </filter>
        <linearGradient
          id="paint0_linear_radar"
          x1="639.24"
          y1="67.4722"
          x2="-35.7878"
          y2="232.474"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6368FF" />
          <stop offset="0.153846" stopColor="#6D185C" />
          <stop offset="0.427885" stopColor="#2DB2FF" />
          <stop offset="1" stopColor="#FF00E1" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const BlurBlockchain: React.FC<IconProps> = ({
  size = 622,
  className,
}) => {
  return (
    <svg
      width={size}
      height={size + 50}
      viewBox="0 0 622 674"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g filter="url(#filter0_f_1149_3467)">
        <path
          d="M240.304 135.168L-6.24609 391V246.55L240.304 0L531.524 226.826L627.244 82.3769L623.763 263.084L531.524 391L240.304 135.168Z"
          fill="url(#paint0_linear_1149_3467)"
        />
        <path
          d="M240.304 135.168L-6.24609 391V246.55L240.304 0L531.524 226.826L627.244 82.3769L623.763 263.084L531.524 391L240.304 135.168Z"
          stroke="black"
          strokeWidth="1.16024"
        />
      </g>
      <defs>
        <filter
          id="filter0_f_1149_3467"
          x="-288.026"
          y="-281.973"
          width="1197.09"
          height="955.611"
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
          <feGaussianBlur
            stdDeviation="140.6"
            result="effect1_foregroundBlur_1149_3467"
          />
        </filter>
        <linearGradient
          id="paint0_linear_1149_3467"
          x1="-18.244"
          y1="67.4722"
          x2="656.784"
          y2="232.474"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6368FF" />
          <stop offset="0.153846" stopColor="#6D185C" />
          <stop offset="0.427885" stopColor="#2DB2FF" />
          <stop offset="1" stopColor="#FF00E1" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const BlurConsole = () => {
  return (
    <svg
      width="916"
      height="466"
      viewBox="0 0 916 466"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_f_1149_3371)">
        <path
          d="M668.758 135.168L915.309 391V246.55L668.758 0L377.539 226.826L281.819 82.3769L285.3 263.084L377.539 391L668.758 135.168Z"
          fill="url(#paint0_linear_1149_3371)"
        />
        <path
          d="M668.758 135.168L915.309 391V246.55L668.758 0L377.539 226.826L281.819 82.3769L285.3 263.084L377.539 391L668.758 135.168Z"
          stroke="black"
          strokeWidth="1.16024"
        />
      </g>
      <defs>
        <filter
          id="filter0_f_1149_3371"
          x="0.000183105"
          y="-281.973"
          width="1197.09"
          height="955.611"
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
          <feGaussianBlur
            stdDeviation="140.6"
            result="effect1_foregroundBlur_1149_3371"
          />
        </filter>
        <linearGradient
          id="paint0_linear_1149_3371"
          x1="927.307"
          y1="67.4722"
          x2="252.279"
          y2="232.474"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6368FF" />
          <stop offset="0.153846" stopColor="#6D185C" />
          <stop offset="0.427885" stopColor="#2DB2FF" />
          <stop offset="1" stopColor="#FF00E1" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const Blur = BlurRadar;
