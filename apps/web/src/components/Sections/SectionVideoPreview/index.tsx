import React from "react";
import Image from "next/image";

export const SectionVideoPreview: React.FC = () => {
  const videoSrc = "/videos/app-demo.mp4";
  const illustrationSrc = "/img/video-illustration.svg";

  return (
    <section className="relative w-full bg-[#F5F8FF] dark:bg-[#000000] py-32 pt-[22rem] px-6 flex flex-col items-center text-center overflow-hidden">
      {/* Background Illustration */}
      <div className="absolute inset-0 z-10 flex justify-center items-center  dark:opacity-20 top-24 w-full">
        <Image
          src={illustrationSrc}
          alt="Background illustration"
          width={1057}
          height={1389}
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Video */}
      <div className="max-w-4xl w-full relative z-10">
        <div className="relative rounded-2xl shadow-lg overflow-hidden">
          <video
            className="w-full h-auto min-h-[500px] m"
            src={videoSrc}
            controls
            playsInline
          >
            <track
              kind="captions"
              src="/videos/app-demo.vtt"
              srcLang="en"
              label="English"
              default
            />
          </video>
        </div>
      </div>
    </section>
  );
};
