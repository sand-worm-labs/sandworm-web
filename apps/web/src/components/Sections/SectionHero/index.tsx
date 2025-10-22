"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { ChatLaunchInput } from "./ChatLaunchInputProps";
import { Button } from "@sandworm/ui/components/button";
import Image from "next/image";

export const SectionHero = () => {
  const [input, setInput] = useState("");
  const router = useRouter();

  // ⬢ Handle Input Submission ⬢
  // =====================================
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    router.push(`/chat?input=${encodeURIComponent(input)}`);
  };

  return (
    // 💬 Note: we use a static background for now till we replace with animation
    <section
      className="py-16 text-center pb-64 min-h-screen pt-28  text-white relative "
      style={{
        backgroundImage: `url('/img/temp.svg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container mx-auto relative flex flex-col h-full items-center">
        {/* ════════════ Hero Text Content ════════════ */}
        <div className="flex items-center space-x-6 relative mt-20 lg:mt-12 w-full">
          <div className=" relative py-6 w-full">
            <h1 className="mx-auto tracking-wide leading-[1.3] px-3 lg:px-0 lg:text-[2.8rem] text-3xl font-primary ">
              Deep, clean Blockchain Data Analysis
            </h1>
            <p className="text-custom-gray mt-7 mb-3 lg:max-w-[40rem] mx-auto font-primary text-lg">
              Sandworm gives you deep, clear, and editable data on various
              blockchains, driving your whole team to make better data-based
              decisions.
            </p>
          </div>
        </div>

        {/* ════════════ Hero Action Buttons ════════════ */}
        <div className="flex space-x-4 mb-10">
          <Button
            type="button"
            className="rounded-2xl p-2.5 h-fit m-0.5 text-black bg-white px-5"
            onClick={() => router.push("/chat")}
          >
            Get Started
          </Button>

          <Button
            type="button"
            className="rounded-2xl p-2.5 h-fit m-0.5 text-black bg-primary  px-5 font-medium"
            onClick={() => router.push("/chat")}
          >
            Explore Worm AI
          </Button>
        </div>

        {/* ════════════ Chat Launch Input ════════════ */}
        <form onSubmit={handleSubmit} className="w-3/4 mx-auto">
          <ChatLaunchInput
            input={input}
            onInputChange={e => setInput(e.target.value)}
            onSubmit={handleSubmit}
          />
        </form>
      </div>

      {/* ════════════ Backed by ════════════ */}
      <div className="absolute bottom-16 w-full text-center px-5 text-white flex flex-col items-center">
        <h2 className="uppercase text-sm font-medium mb-5">Trusted by</h2>
        <div className="flex flex-wrap  items-center gap-8">
          <Image
            src="/img/base-logo.svg"
            alt="Base logo"
            width={98}
            height={32}
            className="object-contain opacity-80 hover:opacity-100 transition filter invert"
          />
          <Image
            src="/img/icn-logo-black.svg"
            alt="ICN Logo"
            width={130}
            height={32}
            className="object-contain opacity-80 hover:opacity-100 transition filter invert"
          />
        </div>
      </div>
    </section>
  );
};
