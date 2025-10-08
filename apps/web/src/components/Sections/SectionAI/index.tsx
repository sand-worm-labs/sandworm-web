import React from "react";
import Image from "next/image";

import { SparkleIcon } from "@/components/Assets/Sparkle";

export const SectionAI = () => {
  const cards = [
    {
      title: "Create Charts",
      description:
        "Easily prompt and create charts, comparing, contrasting, analysing data from the blockchain all from a single prompt on our AI.",
      image: "/img/img1.svg",
    },
    {
      title: "User Insights",
      description:
        "Get information on user behaviour, insights, transaction statistics, campaign outlook and more easily.",
      image: "/img/img1.svg",
    },
    {
      title: "Market Trends",
      description:
        "Analyse price action over any period of time to spot trends, systems and underlying issues before others do.",
      image: "/img/img1.svg",
    },
  ];

  return (
    <section className="py-32">
      <div className="container mx-auto text-center flex flex-col items-center">
        <h3 className="uppercase mb-5 text-sm font-medium">
          Let’s talk worm AI
        </h3>
        <h1 className="mx-auto tracking-wide leading-[1.3] px-3 lg:px-0 text-[#A6554D] uppercase font-bold text-6xl text-center">
          complex Onchain <br /> insight made easy
        </h1>

        <div className="border border-[#D3DBF4] bg-[#ECF6FF] rounded-xl py-2 my-8 w-auto mx-auto text-[#3B5C6A] mb-14 flex gap-4 items-center px-6 justify-center text-xs">
          {" "}
          <SparkleIcon />
          <p>
            Create a bar chart of the tokens with {">"} $1m mcap on Zora in
            August, 2025
          </p>
        </div>

        {/* Cards Grid */}
        <h2 className="text-sm mb-1 text-left font-semibold uppercase text-[#06060A]">
          Accelerate with AI
        </h2>
        <div className="grid gap-8 mt-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-[#ECF6FF] border border-[#D3DBF4] dark:bg-[#111111] rounded-2xl shadow-md p-6 flex flex-col text-left "
            >
              <div className="flex space-x-6 mb-4">
                <SparkleIcon />
                <h4 className="text-sm text-[#3B5C6A] font-semibold mb-3">
                  {card.title}
                </h4>
              </div>

              <p className="text-[#242A2D] dark:text-gray-300 text-[0.95rem] leading-relaxed font-medium helvetica-neue">
                {card.description}
              </p>
              <div className="w-full h-[10rem] relative">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
