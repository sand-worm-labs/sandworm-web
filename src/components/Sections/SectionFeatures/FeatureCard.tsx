import type { FC } from "react";

import type { IFeatures } from "@/types";

export const FeatureCard: FC<IFeatures> = ({ id, bgText, desc }) => {
  return (
    <div className="border-2 border-borderLight p-5 py-8 relative overflow-hidden pad hover:bg-dark-translucent hover:border-borderHover bg-gradient-custom rounded ">
      <span className="absolute inset-0 flex items-end justify-center text-[5rem]  uppercase tracking-wide  left-[4rem] mb-6 text-effect ">
        {bgText}
      </span>
      <div className="relative min-h-[16rem]">
        <h2 className="font-medium text-2xl">{id}.</h2>
        <p className="text-sm text-[#DBDBDB] mt-2">{desc}</p>
      </div>
    </div>
  );
};
