"use client";

import React from "react";
import { motion } from "framer-motion";

import { Blob, Noise } from "../SectionHero/Blob";

export const ComingSoonSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1 } },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section
      className="py-16 text-center min-h-dvh pt-28 text-white relative font-secondary"
      style={{
        backgroundImage: "url('/img/temp.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="z-10 relative h-full flex flex-col items-center justify-center pt-24">
        <motion.div
          className="absolute inset-0 opacity-60 transition-all duration-500 ease-out"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1 }}
        />

        <motion.div
          className="px-5 lg:px-0"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-4xl lg:text-6xl font-bold font-primary mb-5"
            variants={textVariants}
          >
            Coming Soon
          </motion.h1>
          <motion.p
            className="text-custom-gray lg:text-lg max-w-xl mx-auto"
            variants={textVariants}
          >
            We’re cooking something amazing! Stay tuned
          </motion.p>
        </motion.div>
      </div>

      <Blob />
      <Noise />
    </section>
  );
};
