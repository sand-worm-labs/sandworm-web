import React from "react";
import Link from "next/link";
import { FaDiscord } from "react-icons/fa";

export const SectionOnboard = () => {
  return (
    <section className="mt-16 mb-16 container mx-auto px-5">
      <div className="grid-overlay" />
      <div className="  mx-auto mt-4 py-16 text-center pt-8 content ">
        <div className="rounded-lg border border-[#ffffff30] lg:w-[80%] mx-auto p-1">
          <div className="lg:py-28 py-20 lg:px-8 px-4 border-[#ffffff60] border rounded-lg  flex flex-col items-center justify-center">
            <h1 className="lg:text-[4.5rem] text-4xl text-[#A6554D] mb-7 uppercase font-bold leading-[1.3] ">
              Join the Sandworm Community
            </h1>
            <p className="text-lg lg:px-16 text-[#242A2D] helvetica-neue font-medium leading-relaxed">
              Join our Discord to discover insights from other analysts, stay
              updated with new features and releases, and be the first to know
              about Sandworm updates.
            </p>
            <Link
              className="border py-3 bg-black text-white border-white rounded-full px-12 text-base  mt-10 font-medium flex items-center hover:bg-btnHover"
              href="https://discord.gg/pftQtpcjK2"
              target="_blank"
            >
              <FaDiscord />
              <span className="ml-3">Join</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
