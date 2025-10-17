import React from "react";
import Link from "next/link";
import { Star } from "@/components/Assets/Star";
import Image from "next/image";

interface FeatureCardProps {
  children: React.ReactNode;
  className?: string;
}

export const FeatureCard = ({ children, className = "" }: FeatureCardProps) => {
  return (
    <div
      className={`border border-white/20 rounded-2xl p-8 bg-black/40 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
};

// 💭 The images on each card will be animated for final form

export const SectionFeatures = () => {
  return (
    <section className="py-32 bg-black text-white">
      <div className="container mx-auto px-5 py-16 ">
        <h3 className="uppercase mb-5 text-sm font-medium mt-5 text-center">
          ● Built to Last ●
        </h3>
        <h1 className="lg:text-[4.5rem] text-4xl text-primary mb-16 uppercase font-bold leading-[1.3] text-center">
          Built for the future
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* ════════════ First Card ════════════ */}
          <FeatureCard>
            <div>
              <div>
                <Image
                  alt="wormcard-placeholder"
                  className=" object-contain"
                  src="/img/radar-static.svg"
                  width={386}
                  height={386}
                  priority
                />
              </div>
            </div>
            <Star />
            <h3 className="uppercase text-sm mb-4 font-semibold mt-6">
              Explore
            </h3>
            <p className="text-custom-gray text-sm">
              Our protocol helps teams hit their data goals, whether it’s
              checking live balances across wallets, gaining on-chain insights
              into onboarding activities, or comparing activity across several
              blockchains over any time frame.
            </p>
            <Link
              className="border py-2 bg-white text-black rounded-2xl px-3 text-sm mt-10 font-medium inline-block"
              href="/workspace"
              target="_blank"
            >
              <span className="ml-3">Launch App</span>
            </Link>
          </FeatureCard>

          {/* ════════════ Second Card ════════════ */}
          <FeatureCard>
            <div>
              <Image
                alt="wormcard-placeholder"
                className=" object-contain"
                src="/img/chainimages.svg"
                width={576}
                height={345}
                priority
              />
            </div>
            <h3 className="uppercase text-sm mb-4 font-semibold mt-2">
              Query the blockchain
            </h3>
            <p className="text-custom-gray text-sm">
              You can explore over 25+ blockchain networks, comparing data,
              getting information and building a database, all with natural
              language prompts.
            </p>
            <Link
              className="border py-2 bg-white text-black rounded-2xl px-3 text-sm mt-10 font-medium inline-block"
              href="/workspace"
              target="_blank"
            >
              <span className="ml-3">Launch App</span>
            </Link>
          </FeatureCard>

          {/* ════════════ Third Card ════════════ */}
          <FeatureCard className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h3 className="uppercase text-sm mb-4 font-semibold mt-2">
                Powerful sql
              </h3>
              <p className="text-custom-gray text-sm">
                Integrate the Sandworm API into your workflow or dashboard. Use
                WQL to craft on-chain intelligence tailored for your team.
              </p>
              <Link
                className="border py-2 bg-white text-black rounded-2xl px-3 text-sm mt-10 font-medium inline-block"
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
                src="/img/console.svg"
                width={576}
                height={345}
                priority
              />
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
};
