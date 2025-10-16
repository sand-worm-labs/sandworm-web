import React from "react";
import Link from "next/link";
import Image from "next/image";

export const SectionOnboard = () => {
  return (
    <section className="mt-16  px-5 relative">
      <div className="absolute top-0 left-0 h-full w-full">
        <Image src="/img/light-bar.svg" fill alt="unaminated background" />
      </div>

      <div className="  mt-4 py-16 text-center pt-8 pb-28 container mx-auto relative ">
        <div className="rounded-lg lg:w-[80%] mx-auto p-1">
          <div className="lg:py-28 py-20 lg:px-8 px-4   flex flex-col items-center justify-center">
            <h1 className="lg:text-[4rem] text-4xl text-white mb-7 uppercase font-bold leading-[1.1] ">
              ACCESS ONCHAIN DATA IN SECONDS, NOT DAYS
            </h1>

            <Link
              className="border py-3 bg-white text-black rounded-2xl px-6 text-sm  mt-10 font-medium flex items-center hover:bg-btnHover"
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
