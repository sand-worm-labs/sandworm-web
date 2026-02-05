"use client";

import React from "react";
import { Button } from "@sandworm/ui/components/button";
import Image from "next/image";

export const SectionVideoPreview: React.FC = () => {

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
      <div className="max-w-6xl w-full relative z-10">
        <div className="relative rounded-2xl shadow-lg overflow-hidden">
          <Image
            className="w-full h-auto min-h-[500px]"
            alt="Video Preview"
            width={1144}
            height={665}
            src="/img/preview.png"
          />
        </div>
      </div>

      {/* ════════════ Text Content Overlay ════════════ */}
      <div className="lg:absolute bottom-0 grid lg:grid-cols-[65%,35%]  lg:px-16 px-2 lg:pt-20 pt-16 z-10 bg-gradient-to-b from-transparent to-black/90 backdrop-blur-[0.2rem] w-full">
        <div className="overflow-hidden smooth-text">
          <h3 className="uppercase font-semibold mb-4 text-xs">
            ● Easy intelligence
          </h3>

          <h1 className="lg:text-[2.5rem] text-3xl leading-[1.4] font-body font-medium">
            Unlock Clear,
            <br />
            Actionable Data for
            <br />
            Smarter Decisions.
          </h1>
        </div>

        <div className="text-base text-custom-light-gray leading-[1.5]">
          <p className="mb-5 font-body">
            Most analytics tools are built for engineers, complicated, rigid,
            and slow. Sandworm brings simplicity and speed to everyone.
          </p>
          <p className="font-body">
            Whether you're a protocol team, data analyst, or founder, Sandworm
            adapts to how you work — not the other way around.
          </p>
          <div>
            <Button
              type="button"
              className="rounded-2xl p-2.5 h-fit m-0.5 bg-white text-black hover:scale-105 px-5 font-medium inline-block text-sm mt-5"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
