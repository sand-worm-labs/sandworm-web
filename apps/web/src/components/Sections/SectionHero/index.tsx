"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@sandworm/ui/components/button";
import Image from "next/image";
import { motion } from "framer-motion";

import { ChatLaunchInput } from "./ChatLaunchInputProps";

export const SectionHero = () => {
  const [input, setInput] = useState("");
  const router = useRouter();

  // ⬢ Handle Input Submission ⬢
  // =====================================
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    router.push(`/waitlist?input=${encodeURIComponent(input)}`);
  };

  // ⬢ Animation Variant ⬢
  // =====================================
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
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
    hidden: { opacity: 0, scale: 0.96 },
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

  const logoVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 0.8,
      y: 0,
      transition: {
        delay: 0.8 + i * 0.1,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
    hover: {
      opacity: 1,
      y: -4,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      className="py-16 text-center pb-64 min-h-dvh pt-28 text-white relative"
      style={{
        backgroundImage: "url('/img/herobg.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="z-10 relative h-full">
        <motion.div
          className="absolute inset-0 opacity-60 transition-all duration-500 ease-out"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1 }}
        />

        <div className="container mx-auto relative flex flex-col h-full items-center">
          {/* ════════════ Hero Text Content ════════════ */}
          <motion.div
            className="flex items-center space-x-6 relative mt-20 lg:mt-8 w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="relative py-6 w-full">
              <h1 className="mx-auto leading-[1.3] px-3 lg:px-0 lg:text-[2.9rem] text-3xl font-primary font-semibold ">
                Deep, clean Blockchain Data Analysis
              </h1>

              <motion.p
                variants={itemVariants}
                className="text-custom-gray mt-5 mb-3 lg:max-w-[35rem] mx-auto font-primary text-base font-medium"
              >
                Sandworm gives you deep, clear, and editable data on various
                blockchains, driving your whole team to make better data-based
                decisions.
              </motion.p>
            </div>
          </motion.div>

          {/* ════════════ Hero Action Buttons ════════════ */}
          <motion.div
            className="flex space-x-4 mb-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                type="button"
                className="rounded-2xl p-2.5 h-fit m-0.5 text-black bg-white px-5 transition-colors duration-200 hover:bg-white/80 border border-white"
                onClick={() => router.push("/waitlist")}
              >
                Get Started
              </Button>
            </motion.div>

            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                type="button"
                className="rounded-2xl p-2.5 h-fit m-0.5 text-white  bg-primary px-5 font-medium border border-white"
                onClick={() => router.push("/waitlist")}
              >
                Explore Worm AI
              </Button>
            </motion.div>
          </motion.div>

          {/* ════════════ Chat Launch Input ════════════ */}
          <motion.form
            onSubmit={handleSubmit}
            className="lg:w-[47rem] w-[95%] lg:mx-auto  "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.6,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <ChatLaunchInput
              input={input}
              onInputChange={e => setInput(e.target.value)}
              onSubmit={handleSubmit}
            />
          </motion.form>
        </div>
      </div>
      {/*     <Blob />
      <Noise /> */}

      {/* ════════════ Backed by ════════════ */}
      <div className="absolute bottom-16 w-full text-center px-5 text-white flex flex-col items-center z-10">
        <motion.h2
          className="uppercase text-sm font-medium mb-5 text-[#C5C5C5]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.7,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          Trusted by
        </motion.h2>
        <div className="flex flex-wrap items-center gap-8">
          <motion.div
            custom={0}
            variants={logoVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <Image
              src="/img/base-logo.svg"
              alt="Base logo"
              width={98}
              height={32}
              className="object-contain transition filter invert"
            />
          </motion.div>
          <motion.div
            custom={1}
            variants={logoVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <Image
              src="/img/icn-logo-black.svg"
              alt="ICN Logo"
              width={130}
              height={32}
              className="object-contain transition filter invert"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
