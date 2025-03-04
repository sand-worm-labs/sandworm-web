import React from "react";
import Image from "next/image";
import { ArrowLeft } from "@/components/Assets/ArrowLeft";

export const SectionHero = () => {
  return (
    <section className="p-8 flex flex-col h-full items-center py-24 pt-8 text-center pb-64 min-h-[100vh] hero">
      <Image
        width={350}
        height={300}
        alt="arrows top"
        className="mb-14"
        src="/img/arrowtop.png"
      />

      <p className="text-xl font-medium">Welcome to</p>
      <div className="flex items-center space-x-6 ">
        {" "}
        <ArrowLeft />{" "}
        <h1 className="text-[6.5rem] font-medium uppercase tracking-wider leading-[1.3] ">
          Sandw0rm
        </h1>
        <div className=" rotate-180 ml-[-1rem] ">
          <ArrowLeft />
        </div>
      </div>

      <p className="text-[#DBDBDBCC] mt-3  max-w-[45rem]">
        The simplest way to analyze and explore the Sui blockchain with a
        SQL-like query language, high-performance engine, and community-driven
        insights.
      </p>
    </section>
  );
};
