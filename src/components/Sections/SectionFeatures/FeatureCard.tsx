"use client";

import type { FC } from "react";
import { useState } from "react";

import type { IFeatures } from "@/types";

export const FeatureCard: FC<IFeatures> = ({ id, bgText, desc }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="border-2 border-borderLight p-5 py-8 relative overflow-hidden pad hover:bg-dark-translucent hover:border-borderHover bg-gradient-custom rounded"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 flex items-end justify-start overflow-hidden left-0 mb-6">
        <div
          className={`whitespace-nowrap text-[5rem] uppercase tracking-wide text-effect transition-all duration-300 ${
            isHovered ? "animate-marquee" : ""
          }`}
        >
          {bgText} {bgText} {bgText} {bgText} {bgText}
        </div>
      </div>
      <div className="relative min-h-[16rem]">
        <h2 className="font-medium text-2xl">{id}.</h2>
        <p className="text-sm text-[#DBDBDB] mt-2">{desc}</p>
      </div>
    </div>
  );
};
