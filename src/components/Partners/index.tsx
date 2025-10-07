"use client";

import React from "react";
import Image from "next/image";

export const PartnersSection = () => {
  return (
    <div className="w-full max-w-5xl mx-auto text-left mt-8">
      <h4 className="text-sm font-medium mb-3 roobert">Trusted by</h4>

      <div className="flex flex-wrap  items-center gap-8">
        <Image
          src="/img/base-logo.svg"
          alt="Base logo"
          width={49}
          height={16}
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
