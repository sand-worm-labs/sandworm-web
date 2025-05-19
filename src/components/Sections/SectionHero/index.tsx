import React from "react";
import Image from "next/image";
import Link from "next/link";

import { CircleGeometry } from "@/components/Assets/CircleGeometry";

export const SectionHero = () => {
  return (
    <section className="  py-16 pt-0 text-center pb-64 ">
      <div className="container mx-auto  relative flex flex-col h-full items-center">
        <div className="relative  overflow-hidden hidden lg:block">
          <Image
            alt="arrows top"
            className=" object-contain"
            src="/img/arrowtop.png"
            width={370}
            height={180}
            priority
          />
        </div>

        <div className="absolute left-[8rem]">
          <CircleGeometry />
        </div>

        <div className="absolute left  top-[4rem] left-[6rem]  bottom-[-5rem] hero-line border-dashed hero-line" />
        <div className="absolute right  bottom-[-5rem] top-[4rem] right-[6rem]   hero-line  border-dashed hero-line" />

        <div className="flex items-center space-x-6 relative mt-20 lg:mt-0 w-full ">
          <div className="lg:text-[3.5rem] text-4xl uppercase  font-[900] hero-title relative py-6 w-full">
            <h1 className="mx-auto tracking-wide leading-[1.3] px-3 lg:px-0">
              Open Analytics for Blockchain Data
            </h1>
          </div>
        </div>
        <div className="text-[#DBDBDBCC] lg:py-10 py-6 lg:text-lg  hero-desc relative w-full mx-auto">
          <p className=" max-w-[55rem] mx-auto px-3 ">
            {" "}
            The simplest way to analyze and explore blockchain data with a
            SQL-like query language, high-performance engine, and
            community-driven insights.
          </p>
        </div>
        <div className="hero-btn relative w-full flex justify-center ">
          <div className="justify-center  flex space-x-5 hero-btn-inner py-12 lg:px-8">
            <Link
              href="/workspace"
              className="inline-block font-medium bg-white rounded py-3 lg:px-6 px-3 text-black text-[0.9rem] hover:bg-white/85"
            >
              Go to Workspace
            </Link>
            <Link
              href="/explore"
              className="inline-block font-medium rounded py-3 lg:px-6  border-borderLight border text-[0.9rem] px-3  hover:bg-btnHover"
            >
              Explore Queries
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
