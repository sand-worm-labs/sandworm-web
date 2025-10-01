import React from "react";
import Image from "next/image";
import Link from "next/link";

import { CircuitIcon } from "@/components/Assets/Circuit";

export const SectionExplore = () => {
  return (
    <section className="py-32">
      <div className="container mx-auto px-5 py-16 grid grid-cols-2 ">
        <div className="my-16 pr-20">
          <CircuitIcon />
          <h3 className="uppercase text-sm mb-4 font-semibold mt-8">
            query the blockchain
          </h3>
          <p>
            You can explore over 25+ blockchain networks, comparing data,
            getting information and building a database, all with natural
            language prompts.
          </p>
          <Link
            className="border py-3 bg-black text-white border-white rounded-2xl px-4 text-sm  mt-10 font-medium hover:bg-btnHover inline-block"
            href="https://discord.gg/pftQtpcjK2"
            target="_blank"
          >
            <span className="ml-3">Explore Queries</span>
          </Link>
        </div>
        <div>
          <Image
            alt="wormcard-placeholder"
            className=" object-contain"
            src="/img/chainimages.svg"
            width={1007}
            height={166}
            priority
          />
        </div>
      </div>
    </section>
  );
};
