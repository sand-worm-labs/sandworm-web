"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@sandworm/ui/components/button";
import { useRouter } from "next/navigation";

export const SectionOnboard = () => {
  const router = useRouter();
  return (
    <section className="pt-16  px-5 relative bg-black">
      <div className="absolute top-0 left-0 h-full w-full">
        <Image src="/img/light-bar.svg" fill alt="unaminated background" />
      </div>

      <div className="  mt-4 py-32 text-center pt-8 pb-48 container mx-auto relative  ">
        <div className="rounded-lg lg:w-[80%] mx-auto p-1">
          <div className="lg:py-28 py-20 lg:px-8 px-4   flex flex-col items-center justify-center">
            <h1 className="lg:text-[3.8rem] text-4xl text-white mb-7 uppercase leading-[1.1] font-black lg:max-w-[650px]">
              Access onchain data in seconds, not days
            </h1>

            <Button
              type="button"
              className="rounded-2xl p-2.5 h-fit m-0.5 text-black bg-white px-5 transition-colors duration-200 hover:bg-white/80"
              onClick={() => router.push("/chat")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
