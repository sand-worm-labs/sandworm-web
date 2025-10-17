"use client";

import Image from "next/image";
import Link from "next/link";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import { FaCheck } from "react-icons/fa";

import { TerminalFrame } from "./TerminalFrame";
import { ExecutionResultPreview } from "./ExecutionResultPreview";

const workflowSteps = [
  {
    title: "Create and edit notes",
    description:
      "Using our powerful AI, create a full notebook, filled with charts, data points, information and more, all editable, from the raw SQL, to the visualization type.",
    url: "/workspace",
    learnMoreUrl: "https://docs.sandwormlabs.xyz",
    imageUrl: "/img/queries.png",

    bullets: [
      "Use an SQL-like language designed for on-chain data",
      "Filter and sort transactions without the headache",
      "Pull real-time or historical data",
    ],
  },
  {
    title: "visualize and store data",
    url: "/workspace",
    learnMoreUrl: "https://docs.sandwormlabs.xyz",
    description:
      "View, understand, utilize and store the information you got from using our product.",
    imageUrl: "/img/queries.png",
    preview: <ExecutionResultPreview />,
    bullets: [
      "Real-time query execution with instant feedback",
      "No indexers or setup required",
      "Works out of the box with blockchain data",
    ],
  },
  {
    title: "Organize and export notebooks",
    url: "workspace/explore",
    learnMoreUrl: "https://docs.sandwormlabs.xyz",
    imageUrl: "/img/sample.png",
    description:
      "You can create any amount of dashboard to store your visualizations, as well as create texts, add photos etc to personalize it. You can then add these to your subdomain or export them.",
    bullets: [
      "Share links to your queries with anyone",
      "Fork, remix, and iterate on ideas",
      "Collaborate without login walls",
    ],
  },
];

export const SectionWorkFlow = () => {
  return (
    <div className="container mx-auto mt-16 px-6 bg-black">
      <h1 className="lg:text-[4.5rem] text-4xl text-primary mb-16 uppercase font-bold leading-[1.3] text-center">
        Get started in 3 easy steps
      </h1>

      <div className="w-full  grid gap-x-6 grid-cols-3">
        {workflowSteps.map((step, index) => (
          <div
            className="w-full bg-custom-black-200 rounded-2xl h-full"
            key={step.title}
          >
            <div className="  p-6">
              <h3 className=" text-base mb-3 font-bold uppercase text-white">
                {index + 1} {step.title}
              </h3>
              <p className=" text-custom-gray mb-6">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
