import React from "react";
import Image from "next/image";
import Link from "next/link";

import { Star } from "@/components/Assets/Star";

export const SectionLaunch = () => {
  return (
    <section className="py-32 bg-[#F5F8FF] dark:bg-[#000000]">
      <div className="container mx-auto px-5 py-16 grid grid-cols-2 ">
        <div className="my-16 pr-20">
          <Star />
          <h3 className="uppercase text-sm mb-4 font-semibold mt-6">
            Explore{" "}
          </h3>
          <p>
            Our protocol helps teams hit their data goals, whether it’s checking
            live balances across wallets, gaining on-chain insights into
            onboarding activities, or comparing activity across several
            blockchains over any time frame.
          </p>
          <Link
            className="border py-3 bg-black text-white border-white rounded-2xl px-5 text-sm  mt-10 font-medium dark:hover:bg-btnHover inline-block"
            href="/workspace"
            target="_blank"
          >
            <span className="ml-3">Launch App</span>
          </Link>
        </div>
        <div>
          <Image
            alt="wormcard-placeholder"
            className=" object-contain"
            src="/img/imac.svg"
            width={618}
            height={520}
            priority
          />
        </div>
      </div>
    </section>
  );
};
