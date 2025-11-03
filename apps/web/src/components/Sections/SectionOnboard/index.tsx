import React from "react";
import Link from "next/link";
import Image from "next/image";

export const SectionOnboard = () => {
  return (
    <section className="pt-16  px-5 relative bg-black">
      <div className="absolute top-0 left-0 h-full w-full">
        <Image src="/img/light-bar.svg" fill alt="unaminated background" />
      </div>

      <div className="  mt-4 py-32 text-center pt-8 pb-48 container mx-auto relative  ">
        <div className="rounded-lg lg:w-[80%] mx-auto p-1">
          <div className="lg:py-28 py-20 lg:px-8 px-4   flex flex-col items-center justify-center">
            <h1 className="lg:text-[3rem] text-4xl text-white mb-7 uppercase font-bold leading-[1.1] lg:max-w-[600px] ">
              ACCESS ONCHAIN DATA IN SECONDS, NOT DAYS
            </h1>

            <Link
              className="border py-2 bg-white text-black rounded-2xl px-4 text-sm  mt-6 font-medium flex items-center hover:bg-btnHover"
              href="https://discord.gg/pftQtpcjK2"
              target="_blank"
            >
              Launch App
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
