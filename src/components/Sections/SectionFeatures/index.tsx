import React from "react";

import { FeatureCard } from "./FeatureCard";
import { Features } from "./Features";

export const SectionFeatures = () => {
  return (
    <section className="line-bg mt-8">
      <div className="grid-overlay" />

      <div className="container mx-auto py-16 pt-5 content ">
        <div className="grid grid-cols-3 gap-12 pl-[6rem] z-[3] ">
          <div className="text-4xl font-medium leading-[1.6] flex items-center">
            <p className="ml-[-6rem]">
              What's in <br />
              <span className="text-effect2"> Sandworm?</span>
            </p>
          </div>
          {Features.map(item => (
            <FeatureCard
              key={item.id}
              id={item.id}
              name={item.name}
              desc={item.desc}
              bgText={item.bgText}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
