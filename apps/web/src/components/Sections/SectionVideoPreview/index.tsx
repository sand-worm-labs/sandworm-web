"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@sandworm/ui/components/button";

import AnimatedTitle from "@/components/Animations/AnimatedTitle";

export const SectionVideoPreview: React.FC = () => {
  const videoSrc = "/img/preview.png";

  // Animation variants
  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        delay: 0.4,
        ease: "easeOut",
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.5,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },

    tap: {
      scale: 0.98,
    },
  };

  return (
    <section
      className="relative w-full py-32 pt-16 px-6 flex flex-col items-center text-left overflow-hidden text-white bg-black"
      style={{
        backgroundImage: "url('/img/temp2.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* ════════════ Video/Image Preview ════════════ */}
      <motion.div
        className="max-w-6xl w-full relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={imageVariants}
      >
        <motion.div className="relative rounded-2xl shadow-lg overflow-hidden">
          <Image
            className="w-full h-auto min-h-[500px]"
            alt="Video Preview"
            width={1144}
            height={665}
            src={videoSrc}
          />
        </motion.div>
      </motion.div>

      {/* ════════════ Text Content Overlay ════════════ */}
      <motion.div
        className="lg:absolute bottom-20 grid lg:grid-cols-[65%,35%]  lg:px-16 px-2 lg:pt-20 pt-16 z-10 bg-gradient-to-b from-transparent to-black/90 backdrop-blur-[0.2rem] w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={overlayVariants}
      >
        <motion.div
          className="overflow-hidden smooth-text"
          variants={contentVariants}
        >
          <motion.h3
            className="uppercase font-semibold mb-4 text-xs"
            variants={itemVariants}
          >
            ● Easy intelligence
          </motion.h3>

          <AnimatedTitle
            text="Unlock Clear,"
            className="lg:text-[2.5rem] text-3xl leading-[1.4]  font-secondary"
            wordSpace="mr-[14px]"
            charSpace="mr-[0.0005em]"
          />

          <AnimatedTitle
            text="Actionable Data for"
            className="lg:text-[2.5rem] text-3xl  leading-[1.4]  font-secondary"
            wordSpace="mr-[14px]"
            charSpace="mr-[0.0005em]"
          />

          <AnimatedTitle
            text="Smarter Decisions."
            className="lg:text-[2.5rem] text-3xl  leading-[1.4]  font-secondary"
            wordSpace="mr-[14px]"
            charSpace="mr-[0.0005em]"
          />
        </motion.div>

        <motion.div
          className="text-base text-custom-light-gray leading-[1.5]"
          variants={contentVariants}
        >
          <motion.p className="mb-5 font-secondary" variants={itemVariants}>
            Most analytics tools are built for engineers, complicated, rigid,
            and slow. Sandworm brings simplicity and speed to everyone.
          </motion.p>
          <motion.p className="font-secondary" variants={itemVariants}>
            Whether you're a protocol team, data analyst, or founder, Sandworm
            adapts to how you work — not the other way around.
          </motion.p>
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              type="button"
              className="rounded-2xl p-2.5 h-fit m-0.5 bg-white text-black hover:scale-105 px-5 font-medium inline-block text-sm mt-5"
            >
              Get Started
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};
