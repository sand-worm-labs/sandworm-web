import React from "react";
import Image from "next/image";

import { CircleGeometry } from "@/components/Assets/CircleGeometry";
import { MultimodalInputView } from "@/components/Chats/MultimodalInputView";

export const SectionHero = () => {
  return (
    <section className="  py-16  text-center pb-64 min-h-screen bg-[#F4FEFF] dark:bg-[#000000] pt-28">
      <div className="container mx-auto  relative flex flex-col h-full items-center">
        <div className="absolute left-[8rem]">
          <CircleGeometry />
        </div>

        <div className="absolute left  top-[4rem] left-[6rem]  bottom-[-5rem] hero-line border-dashed hero-line" />
        <div className="absolute right  bottom-[-5rem] top-[4rem] right-[6rem]   hero-line  border-dashed hero-line" />

        <div className="flex items-center space-x-6 relative mt-20 lg:mt-0 w-full ">
          <div className="lg:text-[2.8rem] text-4xl uppercase  font-[900] hero-title relative py-6 w-full">
            <h1 className="mx-auto tracking-wide leading-[1.3] px-3 lg:px-0">
              What do you want to explore{" "}
              <span className="text-[#A6554D]">onchain</span> today?{" "}
            </h1>
          </div>
        </div>
        <div className="w-3/4 mx-auto">
          <MultimodalInputView input="" />
        </div>

        <div className="relative  overflow-hidden hidden lg:block mt-24">
          <Image
            alt="wormcard-placeholder"
            className=" object-contain"
            src="/img/wormcard-placeholder.svg"
            width={1007}
            height={166}
            priority
          />
        </div>
      </div>
    </section>
  );
};
