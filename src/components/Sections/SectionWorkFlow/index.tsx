"use client";

import Image from "next/image";
import Link from "next/link";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { TerminalFrame } from "./TerminalFrame";

const workflowSteps = [
  {
    title: "Write Queries",
    description: "Compose powerful WQL queries using familiar SQL syntax.",
    url: "/workspace",
    learnMoreUrl: "https://sandwormdocs.vercel.app/sql-syntax/intro",
    imageUrl: "/img/queries.png",
    bullets: [
      "Use an SQL-like language designed for on-chain data",
      "Filter and sort transactions without the headache",
      "Pull Sui real-time or historical data",
    ],
  },
  {
    title: "Execute and Analyze",
    url: "/workspace",
    learnMoreUrl: "https://sandwormdocs.vercel.app/",
    description:
      "Visualize and explore on-chain data with blazing-fast responses.",
    imageUrl: "/img/queries.png",
    bullets: [
      "Real-time query execution with instant feedback",
      "No indexers or setup required",
      "Works out of the box with Sui data",
    ],
  },
  {
    title: "Share & Collaborate",
    url: "/explore",
    learnMoreUrl: "https://sandwormdocs.vercel.app/",
    imageUrl: "/img/sample.png",
    description: "Publish useful queries to the community for open discovery.",
    bullets: [
      "Share links to your queries with anyone",
      "Fork, remix, and iterate on ideas",
      "Collaborate without login walls",
    ],
  },
];

export const SectionWorkFlow = () => {
  return (
    <div className="container mx-auto mt-16 px-6">
      <h2 className="text-center text-4xl mb-16">How SandWorm Works</h2>

      <div className="w-full  space-y-16">
        {workflowSteps.map((step, index) => (
          <div className="w-full grid md:grid-cols-2 pb-12  ">
            <div key={index} className="lg:pr-10 mt-12">
              <h3 className="text-3xl mb-3 font-medium">{step.title}</h3>
              <p className="text-lg text-[#999999] mb-6">{step.description}</p>

              <div className="flex space-x-4 mb-8">
                <Link
                  href={step.url}
                  className="inline-block font-medium bg-orange-600 rounded py-2.5 px-5 text-white text-[0.9rem] transition duration-200 ease-in-out hover:opacity-90  hover:brightness-90"
                >
                  Get Started
                </Link>
                <Link
                  href={step.learnMoreUrl}
                  target="blank_"
                  className="font-medium rounded py-2.5 px-5 border border-borderLight text-[0.9rem] flex items-center space-x-2  hover:bg-btnHover"
                >
                  <span>Learn More</span>
                  <MdOutlineArrowForwardIos />
                </Link>
              </div>

              <ul className="text-sm space-y-3">
                {step.bullets.map((item, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    <span className="rounded-full bg-dark-translucent p-1">
                      <FaCheck className="text-orange-600 text-[0.65rem]" />
                    </span>
                    <span className="text-[#999999]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-[90%] pt-[1rem] flex justify-center mt-6 md:mt-0">
              <TerminalFrame>
                <Image
                  src={step.imageUrl}
                  width={800}
                  height={512}
                  alt="Workflow Example"
                  className="w-full object-cover border border-gray-800"
                />
              </TerminalFrame>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
