"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@sandworm/ui/components/button";

gsap.registerPlugin(ScrollTrigger);

export const SectionVideoPreview: React.FC = () => {
  const videoSrc = "/img/preview.png";

  useEffect(() => {
    const animatedTexts = gsap.utils.toArray<HTMLElement>(".smooth-text");

    animatedTexts.forEach(el => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          end: "top 40%",
          scrub: true,
        },
        y: 150,
        opacity: 0.4,
        ease: "power1.out",
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section className="relative w-full py-32 px-6 flex flex-col items-center text-left overflow-hidden text-white bg-black">
      {/* ════════════ Video/Image Preview ════════════ */}
      <div className="max-w-6xl w-full relative z-10">
        <div className="relative rounded-2xl shadow-lg overflow-hidden">
          <Image
            className="w-full h-auto min-h-[500px]"
            alt="Video Preview"
            width={1144}
            height={665}
            src={videoSrc}
          />
        </div>
      </div>

      {/* ════════════ Text Content Overlay ════════════ */}
      <div className="absolute bottom-20 grid grid-cols-[70%,30%] container mx-auto px-16 pt-32 z-10 bg-gradient-to-r from-transparent to-black/80">
        <div className="overflow-hidden smooth-text">
          <h3 className="uppercase font-medium mb-2">Easy intelligence</h3>
          <p className="text-4xl leading-[1.4] font-normal font-secondary">
            Unlock Clear, <br /> Actionable Data for <br /> Smarter Decisions.
          </p>
        </div>

        <div className="text-sm text-custom-light-gray helvetica-neue leading-[1.5] smooth-text">
          <p className="mb-5">
            Most analytics tools are built for engineers, complicated, rigid,
            and slow. Sandworm brings simplicity and speed to everyone.
          </p>
          <p>
            Whether you’re a protocol team, data analyst, or founder, Sandworm
            adapts to how you work — not the other way around.
          </p>
          <Button className="bg-white text-black rounded-xl mt-8">
            Get Started
          </Button>
        </div>
      </div>
    </section>
  );
};
