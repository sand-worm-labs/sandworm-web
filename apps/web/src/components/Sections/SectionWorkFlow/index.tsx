"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { Dots } from "@/components/Assets/Dots";

// 🎨 Workflow steps
// =====================================
const workflowSteps = [
  {
    title: "Create and edit notes",
    description:
      "Using our powerful AI, create a full notebook, filled with charts, data points, information and more, all editable, from the raw SQL, to the visualization type.",
    imageUrl: "/img/box-2.png",
    imageConfig: {
      width: 558,
      height: 488,
      className: "",
      containerClassName:
        "absolute bottom-0 left-[-0.2rem] w-full min-h-[400px]",
    },
  },
  {
    title: "Visualize and store data",
    description:
      "View, understand, utilize and store the information you got from using our product.",
    imageUrl: "/img/box1.svg",
    imageConfig: {
      width: 558,
      height: 410,
      className: "",
      containerClassName: "absolute bottom-0 min-h-[400px]",
    },
  },
  {
    title: "Organize and export notebooks",
    description:
      "You can create any amount of dashboard to store your visualizations, add texts, photos etc to personalize it. You can then share or export them.",
    imageUrl: "/img/box3.svg",
    imageConfig: {
      width: 558,
      height: 410,
      className: "",
      containerClassName: "absolute bottom-0 min-h-[400px]",
    },
  },
  {
    title: "Create and edit notes",
    description:
      "Using our powerful AI, create a full notebook, filled with charts, data points, information and more, all editable, from the raw SQL, to the visualization type.",
    imageUrl: "/img/box2.svg",
    imageConfig: {
      width: 558,
      height: 410,
      className: "",
      containerClassName: "absolute bottom-0",
    },
  },
];

/* ╔════════════════════════════════════════════╗
   ║ ⬢ SectionWorkFlow                          ║                       
   ╚════════════════════════════════════════════╝ */
export const SectionWorkFlow = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Calculate based on cards and gaps, then account for viewport
  const cardWidth = 530;
  const gap = 40;
  const totalCardsWidth =
    cardWidth * workflowSteps.length + gap * (workflowSteps.length - 1);

  // Show ~2.5 cards on screen, scroll to reveal rest
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    [0, -(totalCardsWidth - cardWidth * 2.5)]
  );

  return (
    <div className="relative bg-black">
      <div className="px-6 bg-black pt-6 relative container mx-auto">
        <h1 className="uppercase mb-5 text-sm font-medium mt-5 text-white text-center">
          How Sandworm works
        </h1>
        <h1 className="lg:text-[4.5rem] text-4xl text-[#C7C2FF] mb-4 uppercase leading-[1.3] text-center font-secondary font-black">
          Get started in 3 easy steps
        </h1>

        <div className="flex justify-center mb-16">
          <Dots />
        </div>

        {/* Centering wrapper - NO max-width on containerRef */}
        <div className="flex justify-center w-full">
          <div ref={containerRef} className="w-full relative py-20">
            <div className="sticky top-20 h-[600px] overflow-hidden">
              {" "}
              {/* Added overflow-hidden back */}
              <motion.div
                style={{
                  x,
                  willChange: "transform",
                }}
                transition={{
                  ease: "linear",
                  duration: 0,
                }}
                className="flex gap-10 pl-[68px] h-full"
              >
                {workflowSteps.map((step, index) => (
                  <div
                    key={`${step.title}-${index}`}
                    className="w-[530px] flex-shrink-0 bg-custom-black-200 rounded-2xl min-h-[580px] h-full gradient-border relative overflow-hidden"
                  >
                    <div className="inner h-full py-8 px-6 rounded-2xl">
                      <div className="relative z-10 pb-12">
                        <h3 className="mb-3 font-bold uppercase text-white text-xs">
                          {index + 1}. {step.title}
                        </h3>
                        <p className="text-[#8A919E] mb-6 font-body font-medium text-base">
                          {step.description}
                        </p>
                      </div>

                      <div className={step.imageConfig.containerClassName}>
                        <Image
                          src={step.imageUrl}
                          width={step.imageConfig.width}
                          height={step.imageConfig.height}
                          alt={step.title}
                          className={step.imageConfig.className}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
