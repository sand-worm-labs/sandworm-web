import React from "react";
import Image from "next/image";
import { Button } from "@sandworm/ui/components/button";

export const SectionVideoPreview: React.FC = () => {
  const videoSrc = "/img/preview.png";

  return (
    <section className="relative w-full py-32  px-6 flex flex-col items-center text-left overflow-hidden text-white">
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
      <div className="absolute bottom-20 grid grid-cols-[70%,30%] container mx-auto px-16 z-10">
        <div>
          <h3 className="uppercase font-medium mb-2">Easy intelligence</h3>
          <p className="text-3xl leading-[1.6]">
            Unlock Clear, <br /> Actionable Data for <br /> Smarter Decisions.
          </p>
        </div>
        <div className="text-sm text-custom-light-gray">
          <p className="mb-5">
            Most analytics tools are built for engineers, complicated, rigid,
            and slow.Sandworm brings simplicity and speed to everyone.
          </p>
          <p>
            Whether you’re a protocol team, data analyst, or founder, Sandworm
            adapts to how you work not the other way around.
          </p>
          <Button className="bg-white text-black rounded-xl mt-8">
            Get Started
          </Button>
        </div>
      </div>
    </section>
  );
};
