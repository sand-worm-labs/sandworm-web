"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import { Button } from "@sandworm/ui/components/button";

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
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    tap: {
      scale: 0.98,
    },
  };

  return (
    <section className="relative w-full py-32 px-6 flex flex-col items-center text-left overflow-hidden text-white bg-black">
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
        className="absolute bottom-20 grid grid-cols-[70%,30%] container mx-auto px-16 pt-32 z-10 bg-gradient-to-r from-transparent to-black/80 backdrop:blur-lg"
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
            className="uppercase font-semibold mb-6 text-xs"
            variants={itemVariants}
          >
            Easy intelligence
          </motion.h3>
          <motion.p
            className="text-4xl leading-[1.4] font-normal font-secondary"
            variants={itemVariants}
          >
            Unlock Clear, <br /> Actionable Data for <br /> Smarter Decisions.
          </motion.p>
        </motion.div>

        <motion.div
          className="text-sm text-custom-light-gray leading-[1.5]"
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
              className="rounded-xl py-2.5 h-fit m-0.5 text-black bg-white px-4 mt-4 text-xs"
            >
              Get Started
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};
