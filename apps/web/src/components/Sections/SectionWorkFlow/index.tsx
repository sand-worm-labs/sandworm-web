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

/* ╔════════════════════════════════════════════╗
   ║ ⬢ SectionWorkFlow                          ║                       
   ╚════════════════════════════════════════════╝ */
export const SectionWorkFlow = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // ⬢ Scroll-based horizontal animation
  // =====================================
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // 💭 Calculate transform range based on content
  // 💭 Card width (430px) + gap (40px) = 470px per card
  // 💭 Total cards = 4, so total width = 470 * 4 = 1880px
  // 💭 Minus one viewport width to show the last card
  const totalWidth =
    430 * workflowSteps.length + 40 * (workflowSteps.length - 1);
  const endPosition = -(totalWidth - 430);

  const x = useTransform(scrollYProgress, [0, 1], [0, endPosition]);

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
        <h1 className="uppercase mb-5 text-sm font-medium mt-5 text-white text-center">
          How Sandworm works
        </h1>
        <h1 className="lg:text-[4.5rem] text-4xl text-primary mb-4 uppercase leading-[1.3] text-center font-secondary font-black">
          Get started in 3 easy steps
        </h1>

        <div className="flex justify-center mb-16">
          <Dots />
        </div>

        <div ref={containerRef} className="w-full relative py-20">
          <div className="sticky top-20 overflow-hidden h-[500px]">
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
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${step.title}-${index}`}
                  className="w-[430px] flex-shrink-0 bg-custom-black-200 rounded-2xl h-full gradient-border relative"
                >
                  <div className="inner h-full py-8 px-6 rounded-2xl">
                    <h3 className="mb-3 font-bold uppercase text-white text-xs">
                      {index + 1}. {step.title}
                    </h3>
                    <p className="text-custom-gray mb-6 font-secondary font-medium text-sm">
                      {step.description}
                    </p>

                    <div className="absolute bottom-0">
                      <Image
                        src={step.imageUrl}
                        width={558}
                        height={410}
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
    </div>
  );
};
