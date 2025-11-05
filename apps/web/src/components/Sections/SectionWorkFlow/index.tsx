"use client";

import Image from "next/image";
import { Dots } from "@/components/Assets/Dots";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import AnimatedTitle from "@/components/Animations/AnimatedTitle";

const workflowSteps = [
  {
    title: "Create and edit notes",
    description:
      "Using our powerful AI, create a full notebook, filled with charts, data points, information and more, all editable, from the raw SQL, to the visualization type.",
    imageUrl: "/img/box2.svg",
  },
  {
    title: "Visualize and store data",
    description:
      "View, understand, utilize and store the information you got from using our product.",
    imageUrl: "/img/box1.svg",
  },
  {
    title: "Organize and export notebooks",
    description:
      "You can create any amount of dashboard to store your visualizations, add texts, photos etc to personalize it. You can then share or export them.",
    imageUrl: "/img/box3.svg",
  },
  {
    title: "Create and edit notes",
    description:
      "Using our powerful AI, create a full notebook, filled with charts, data points, information and more, all editable, from the raw SQL, to the visualization type.",
    imageUrl: "/img/box2.svg",
  },
];

export const SectionWorkFlow = () => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  // scroll tracking for smooth animation
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "30% start"],
  });

  // transform the x value as the scroll progresses
  const x = useTransform(scrollYProgress, [0, 1], ["68px", "-997px"]);

  return (
    <div className="relative bg-black">
      <div className="w-full flex-col items-center justify-center mx-auto container">
        <Image
          src="/img/illustration.svg"
          width={1391}
          height={1500}
          className="w-[85%] mx-auto"
          alt="illustration"
        />
      </div>

      <div className="container mx-auto px-6 bg-black pt-6 relative">
        <h3 className="uppercase mb-5 text-sm font-medium mt-5 text-white text-center">
          How Sandworm works
        </h3>
        <AnimatedTitle
          text="Get started in 3 easy steps"
          className="lg:text-[4.5rem] text-4xl text-primary mb-4 uppercase  leading-[1.3] text-center font-secondary font-black"
          wordSpace="mr-[14px]"
          charSpace="mr-[0.0005em]"
        />

        <div className="flex justify-center mb-16">
          <Dots />
        </div>

        {/* scroll animation wrapper */}
        <div
          ref={cardRef}
          className="w-full overflow-hidden relative h-[550px] flex justify-center  "
        >
          <motion.div
            style={{ x }}
            transition={{ ease: "easeInOut" }}
            className="flex gap-10 absolute left-[68px] h-full"
          >
            {workflowSteps.map((step, index) => (
              <div
                key={step.title}
                className="w-[430px] flex-shrink-0 bg-custom-black-200 rounded-2xl h-full gradient-border relative"
              >
                <div className="inner h-full py-8 px-6 rounded-2xl">
                  <h3 className="mb-3 font-bold uppercase text-white text-xs">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-custom-gray mb-6 font-secondary font-medium text-sm">
                    {step.description}
                  </p>

                  <div>
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
          </motion.div>
        </div>
      </div>
    </div>
  );
};
