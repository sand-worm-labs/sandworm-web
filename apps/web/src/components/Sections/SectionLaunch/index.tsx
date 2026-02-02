"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

import { Star } from "@/components/Assets/Star";
import { CircuitIcon } from "@/components/Assets/Circuit";
import { Dots } from "@/components/Assets/Dots";
import { Boxes } from "@/components/Assets/Boxes";
import { Blur } from "@/components/Assets/Blur";

interface FeatureCardProps {
  children: React.ReactNode;
  className?: string;
}

export const FeatureCard = ({ children, className = "" }: FeatureCardProps) => {
  return (
    <div
      className={`rounded-2xl backdrop-blur-sm gradient-border relative ${className}`}
    >
      <div className="inner w-full h-full p-8 py-6 rounded-2xl">{children}</div>
    </div>
  );
};

// 💭 The images on each card will be animated for final form

export const SectionFeatures = () => {
  return (
    <section className="lg:py-32 py-16 bg-black text-white">
      <div className="container mx-auto px-5 py-16">
        <h1 className="uppercase mb-5 text-xs font-semibold mt-5 text-center">
          ● Built to Last ●
        </h1>
        <h1 className="lg:text-[4.5rem] text-4xl text-primary mb-4 uppercase font-black leading-[1.3] text-center">
          Built for the future
        </h1>

        <div className="flex justify-center mb-16">
          <Dots />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 gap-x-7">
          {/* ════════════ First Card ════════════ */}
          <FeatureCard>
            <div className="absolute right-0 top-0 left-0 w-full">
              <Blur />
            </div>
            <div className="flex flex-col justify-between z-10 relative">
              <div>
                <div className="flex flex-col items-center">
                  <Image
                    alt="wormcard-placeholder"
                    className="object-contain"
                    src="/img/radar-static.svg"
                    width={386}
                    height={386}
                    priority
                  />
                </div>
              </div>
              <div className="mt-6">
                <Star />
                <h3 className="uppercase text-sm mb-2.5 font-semibold mt-6">
                  ● Explore
                </h3>
                <p className="text-custom-gray font-secondary">
                  Our protocol helps teams hit their data goals, whether it's
                  checking live balances across wallets, gaining on-chain
                  insights into onboarding activities, or comparing activity
                  across several blockchains over any time frame.
                </p>
                <Link
                  className="rounded-xl p-2 h-fit m-0.5 bg-white text-black hover:scale-105 px-4 font-medium inline-block text-sm mt-5"
                  href="/waitlist"
                  target="_blank"
                >
                  Launch App
                </Link>
              </div>
            </div>
          </FeatureCard>

          {/* ════════════ Second Card ════════════ */}
          <FeatureCard>
            <div className="absolute right-0 top-0 left-0 w-full">
              <Blur />
            </div>
            <div className="flex flex-col justify-between h-full z-10 relative">
              <div className="flex flex-col items-center">
                <Image
                  alt="wormcard-placeholder"
                  className="object-contain"
                  src="/img/chainimages.svg"
                  width={606}
                  height={345}
                  priority
                />
              </div>
              <div>
                <CircuitIcon />
                <h3 className="uppercase text-sm mb-2.5 font-semibold mt-6">
                  ● Query the blockchain
                </h3>
                <p className="text-custom-gray font-secondary">
                  You can explore over 25+ blockchain networks, comparing data,
                  getting information and building a database, all with natural
                  language prompts.
                </p>
                <Link
                  className="rounded-xl p-2 h-fit m-0.5 bg-white text-black hover:scale-105 px-4 font-medium inline-block text-sm mt-5"
                  href="/waitlist"
                  target="_blank"
                >
                  Explore Queries
                </Link>
              </div>
            </div>
          </FeatureCard>

          {/* ════════════ Third Card ════════════ */}
          <FeatureCard className="lg:col-span-2 gap-10 w-full overflow-hidden">
            <div className="absolute right-0 top-0 w-[80%]">
              <Blur />
            </div>
            <div className="grid lg:grid-cols-2 relative ">
              <div className="flex flex-col justify-center items-start">
                <Boxes />
                <h3 className="uppercase text-sm mb-2.5 font-semibold mt-6">
                  ● Powerful sql
                </h3>
                <p className="text-custom-gray font-secondary pr-6">
                  Go beyond static charts, create and tweak pure SQL data which
                  powers your visuals to explore deeper insights, test
                  hypotheses, and uncover new trends instantly.
                </p>
                <Link
                  className="rounded-xl p-2 h-fit m-0.5 bg-white text-black hover:scale-105 px-4 font-medium inline-block text-sm mt-5"
                  href="/waitlist"
                  target="_blank"
                >
                  Launch App
                </Link>
              </div>

              <div className="flex flex-col items-end mt-6">
                <Image
                  alt="wormcard-placeholder"
                  className="object-contain"
                  src="/img/console.svg"
                  width={576}
                  height={345}
                  priority
                />
              </div>
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
};
