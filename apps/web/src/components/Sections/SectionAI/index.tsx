import React from "react";
import Link from "next/link";
import { SparkleIcon } from "@/components/Assets/Sparkle";
import { RingIcon } from "@/components/Assets/RingIcon";
import { Users } from "../../Assets/Users";
import { BarChart } from "@/components/Assets/BarChart";
import { Ellipse } from "@/components/Assets/Ellipse";
import { Wave } from "@/components/Assets/Wave";

interface AICardProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

const AICard = ({ title, description, children }: AICardProps) => {
  return (
    <div className="bg-custom-black rounded-2xl gradient-border relative overflow-hidden min-h-[23rem]">
      <div className="bg-custom-black inner rounded-2xl p-6 flex flex-col text-left h-full relative z-10">
        <div className="flex space-x-6 mb-4">
          <SparkleIcon />
          <h4 className="text-sm font-semibold mb-3">{title}</h4>
        </div>
        <p className="text-custom-gray text-[0.95rem] leading-relaxed font-medium font-secondary">
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
      <div className="container mx-auto flex flex-col items-center">
        <RingIcon />
        <h3 className="uppercase mb-5 text-sm font-medium mt-5">
          Let’s talk worm AI
        </h3>

        <h1 className="mx-auto tracking-wide leading-[1.2] px-3 lg:px-0 text-primary uppercase font-bold text-6xl text-center">
          complex Onchain <br /> insight made easy
        </h1>

        <Link
          className="border py-3 bg-white text-black rounded-2xl px-5 text-sm mt-10 font-medium dark:hover:bg-btnHover inline-block"
          href="/workspace"
          target="_blank"
        >
          <span className="ml-3">Use WormAI</span>
        </Link>

        <div className="bg-rainbow-gradient p-1 mt-20 my-8 mb-14 mx-auto rounded-full">
          <div className="rounded-full py-2.5 w-auto flex gap-4 items-center px-6 justify-center text-xs bg-custom-dark-gray">
            <SparkleIcon />
            <p>
              Create a bar chart of the tokens with {">"} $1m mcap on Zora in
              August, 2025
            </p>
          </div>
        </div>

        <h2 className="text-sm mb-1 text-left font-semibold uppercase text-white">
          Accelerate with AI
        </h2>

        <div className="grid gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="absolute bottom-[1.5rem] right-[-4rem] w-[100%]">
              <Wave />
            </div>
          </AICard>
        </div>
      </div>
    </section>
  );
};
