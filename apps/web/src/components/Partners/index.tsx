"use client";

import React from "react";
import Image from "next/image";

export const PartnersSection = () => {
  return (
    <div className="w-full max-w-5xl mx-auto text-left ">
      <div className="flex flex-wrap justify-center items-center gap-8">
        <Image
          src="/img/base-white.svg"
          alt="Base logo"
          width={56}
          height={24}
          className="object-contain opacity-80 hover:opacity-100 transition"
        />
        <Image
          src="/img/icn-logo-black.svg"
          alt="ICN Logo"
          width={98}
          height={24}
          className="object-contain opacity-80 hover:opacity-100 transition"
        />
      </div>
    </div>
  );
};
