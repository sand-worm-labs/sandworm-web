import type { FC } from "react";
import type { IFeatures } from "@/types";

export const FeatureCard: FC<IFeatures> = ({ id, bgText, desc }) => {
  return (
    <div className="border border-[#FFFFFF50] p-5 py-8 relative overflow-hidden">
      <span className="absolute inset-0 flex items-center justify-center text-[6rem] font-bold uppercase tracking-wide text-gray-600 left-[4rem] text-effect ">
        {bgText}
      </span>
      <div className="relative">
        <h2 className="font-medium text-2xl min-h-[14rem]">{id}.</h2>
        <p className="text-sm text-[#DBDBDB]">{desc}</p>
      </div>
    </div>
  );
};
