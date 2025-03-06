import React from "react";
import Image from "next/image";
import Link from "next/link";

export const SectionHero = () => {
  return (
    <section className="p-8 flex flex-col h-full items-center py-16 pt-0 text-center pb-64 min-h-[90vh] relative">
      <div className="relative h-[180px] w-[370px]  overflow-hidden hidden lg:block">
        <Image
          alt="arrows top"
          className="absolute object-contain"
          src="/img/arrowtop.png"
          fill
        />
      </div>

      <div className="absolute left border border-dashed top-[4rem] left-[6rem] border-[hsla(0, 100%, 100%, 0.14)] bottom-[4rem] hero-line " />
      <div className="absolute right border border-dashed bottom-[4rem] top-[4rem] right-[6rem] border-[hsla(0, 100%, 100%, 0.14)]  hero-line" />

      <div className="flex items-center space-x-6 relative mt-20 lg:mt-0 ">
        <div className="lg:text-[3.6rem] text-4xl uppercase  font-[900] hero-title relative py-6 w-full">
          <h1 className="mx-auto tracking-wide leading-[1.3]">
            Open Analytics for Sui Blockchain
          </h1>
        </div>
      </div>
      <div className="text-[#DBDBDBCC] py-10  text-lg hero-desc relative w-full mx-auto">
        <p className=" max-w-[55rem] mx-auto ">
          {" "}
          The simplest way to analyze and explore the Sui blockchain with a
          SQL-like query language, high-performance engine, and community-driven
          insights.
        </p>
      </div>
      <div className="hero-btn relative w-full flex justify-center ">
        <div className="justify-center  flex space-x-5 hero-btn-inner py-12 lg:px-8">
          <Link
            href="/workspace"
            className="inline-block font-medium bg-white rounded py-3 lg:px-6 px-3 text-black text-[0.9rem] "
          >
            Get Started
          </Link>
          <Link
            href="/explore"
            className="inline-block font-medium rounded py-3 lg:px-6  border-borderLight border text-[0.9rem] px-3  hover:bg-btnHover"
          >
            Explore Queries
          </Link>
        </div>
      </div>
    </section>
  );
};
