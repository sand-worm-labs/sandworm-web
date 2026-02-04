"use client";

import React from "react";
import Link from "next/link";

import { SparkleIcon } from "@/components/Assets/Sparkle";
import { RingIcon } from "@/components/Assets/RingIcon";
import { BarChart } from "@/components/Assets/BarChart";
import { Ellipse } from "@/components/Assets/Ellipse";
import { Wave } from "@/components/Assets/Wave";
import { Dots } from "@/components/Assets/Dots";

import { Users } from "../../Assets/Users";

import { Blockchains } from "./Blockchains";

interface AICardProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

const AICard = ({ title, description, children }: AICardProps) => {
  return (
    <div className=" rounded-2xl gradient-border relative overflow-hidden min-h-[22.5rem]">
      <div className="bg-[#0B0B12] inner rounded-2xl p-5 px-4 flex flex-col text-left h-full relative z-10">
        <div className="flex space-x-4 mb-3">
          <SparkleIcon />
          <h4 className="text-[14px] font-semibold mb-3">{title}</h4>
        </div>
        <p className="text-[#8A919E] text-base leading-relaxed font-medium font-body">
          {description}
        </p>
        {children}
      </div>
    </div>
  );
};

export const SectionAI = () => {
  return (
    <section className="py-28 bg-black text-white">
      <div className="container px-4 mx-auto flex flex-col items-center">
        <RingIcon />
        <h3 className="uppercase mb-5 text-xs font-medium mt-5">
          ● Let's talk worm AI ●
        </h3>

        <h1 className="mx-auto leading-[1] px-3 lg:px-0 text-[#C7C2FF] uppercase font-black lg:text-[4rem] text-4xl text-center">
          complex onchain
        </h1>

        <h1 className="mx-auto leading-[1] px-3 lg:px-0 text-[#C7C2FF] uppercase font-bold lg:text-[4rem] text-4xl text-center">
          insight made easy
        </h1>

        <div className="flex justify-center mb-8 mt-8">
          <Dots />
        </div>

        <Link
          className="rounded-2xl p-2.5 h-fit m-0.5 bg-white text-black hover:scale-105 px-5 font-medium inline-block text-sm"
          href="/workspace"
          target="_blank"
        >
          <span className="">Use WormAI</span>
        </Link>

        <div className="bg-rainbow-gradient p-1 mt-28 my-8 mb-8 mx-auto rounded-full">
          <div className="rounded-full py-3 w-auto flex gap-4 items-center px-6 justify-center text-xs bg-[#141B1F]">
            <SparkleIcon />
            <p>
              Create a bar chart of the tokens with {">"} $1m mcap on Zora in
              August, 2025
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full min-h-[250px]">
          <Blockchains />
        </div>
      </div>
      <div className="container mx-auto mt-16 px-4">
        <h2 className="text-[15px] mb-2 mt-16 text-left font-semibold uppercase text-white">
          ● Accelerate with AI
        </h2>

        <div className="grid gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3  ">
          <AICard
            title="Create Charts"
            description="Easily prompt and create charts, comparing, contrasting, analysing data from the blockchain all from a single prompt on our AI."
          >
            <div className="absolute bottom-[4rem] left-12 w-[6rem] h-[6rem]">
              <Ellipse />
            </div>
            <div className="absolute bottom-[-3.5rem] right-5 w-[12rem] h-[12rem]">
              <BarChart />
            </div>
          </AICard>

          <AICard
            title="Query User Data"
            description="Get information on user behaviour, insights, transaction statistics, campaign outlook and more easily."
          >
            <div className="absolute bottom-0 right-0 w-[9rem] h-[9rem]">
              <Users />
            </div>
          </AICard>

          <AICard
            title="Analyze Price Data"
            description="Analyse price action over any period of time to spot trends, systems and underlying issues before others do."
          >
            <div className="absolute bottom-[1.5rem] right-[-2rem] left-6 w-[100%]">
              <Wave />
            </div>
          </AICard>
        </div>
      </div>
    </section>
  );
};
