"use client";

import Image from "next/image";

import { Dots } from "@/components/Assets/Dots";

import { ExecutionResultPreview } from "./ExecutionResultPreview";

const workflowSteps = [
  {
    title: "Create and edit notes",
    description:
      "Using our powerful AI, create a full notebook, filled with charts, data points, information and more, all editable, from the raw SQL, to the visualization type.",
    url: "/workspace",
    learnMoreUrl: "https://docs.sandwormlabs.xyz",
    imageUrl: "/img/box2.svg",

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
    imageUrl: "/img/box1.svg",
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
    imageUrl: "/img/box3.svg",
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
    <>
      <div className="w-full flex-col items-center justify-center mx-auto container">
        <Image
          src="/img/illustration.svg"
          width={1391}
          height={1500}
          className="w-[85%] mx-auto"
          alt="illustration"
        />
      </div>
      <div className="container mx-auto  px-6 bg-black pt-6">
        <h3 className="uppercase mb-5 text-sm font-medium mt-5 text-white text-center">
          How Sandworm works
        </h3>
        <h1 className="lg:text-[4.5rem] text-4xl text-primary mb-4 uppercase font-bold leading-[1.3] text-center">
          Get started in 3 easy steps
        </h1>
        <div className="flex justify-center mb-16">
          <Dots />
        </div>

        <div className="w-full  grid gap-x-6 grid-cols-3">
          {workflowSteps.map((step, index) => (
            <div
              className="w-full bg-custom-black-200 rounded-2xl  h-full gradient-border relative "
              key={step.title}
            >
              <div className=" inner h-full py-8 px-6 rounded-2xl">
                <h3 className="  mb-3 font-bold uppercase text-white text-xs ">
                  {index + 1} {step.title}
                </h3>
                <p className=" text-custom-gray mb-6 font-secondary text-sm">
                  {step.description}
                </p>

                <div className=" ">
                  <Image
                    src={step.imageUrl}
                    width={558}
                    height={511}
                    alt="image"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
