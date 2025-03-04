import Image from "next/image";
import Link from "next/link";
import { FaDiscord } from "react-icons/fa";

import MainLayout from "@/layouts/MainLayout/MainLayout";
import { SandwormLogo } from "@/components/Assets/SandwormLogo";
import { ArrowLeft } from "@/components/Assets/ArrowLeft";
import { SectionFeatures } from "@/components/Sections/SectionFeatures";
import { SectionHero } from "@/components/Sections/SectionHero";

export default function Home() {
  return (
    <MainLayout>
      <header>
        <div className="container mx-auto flex justify-between items-center py-6 mt-6">
          <Link href="/" className="flex items-center ">
            <SandwormLogo />
            <span className="ml-3 font-medium text-xl uppercase">
              Sandw0rm.
            </span>
          </Link>
          <Link
            className="border py-1.5 border-white rounded-full px-8 text-base  font-medium  items-center"
            href="/explore"
          >
            <span>Launch App</span>
          </Link>
        </div>
      </header>
      <SectionHero />
      <SectionFeatures />

      <section>
        <div className=" mx-auto py-32">
          <h2 className="text-center text-4xl mb-8">How SandWorm Works</h2>
          <div className="border-t border-b  border-[#FFFFFF20]  ">
            <div className="py-16 container mx-auto grid lg:grid-cols-2 gap-6">
              <div className="lg:pr-10">
                <h3 className="text-3xl mb-3 mt-12">Write Queries</h3>
                <p className="text-lg text-[#999999]">
                  Use our SQL-like language to interact with on-chain data
                </p>
              </div>
              <div className="relative">
                <Image
                  src="/img/sample.png"
                  width={800}
                  height={512}
                  alt="Write Queries"
                  className="w-full border-[0.5px] border-[#404040] object-cover rounded-sm"
                />
              </div>
            </div>
          </div>
          <div className="border-t border-b  border-[#FFFFFF20]  ">
            <div className="py-16 container mx-auto grid lg:grid-cols-2 lg:gap-16 gap-5">
              <div className="relative">
                <Image
                  src="/img/sample.png"
                  width={800}
                  height={512}
                  alt="Write Queries"
                  className="w-full border-[0.5px] border-[#404040] object-cover rounded-sm"
                />
              </div>
              <div className="lg:pr-10">
                <h3 className="text-3xl mb-3 mt-12">Run & Visualize</h3>
                <p className="text-lg text-[#999999]">
                  Get real-time insights through our high-performance engine.
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-b  border-[#FFFFFF20]  ">
            <div className="py-16 container mx-auto grid lg:grid-cols-2 lg:gap-16 gap-5">
              <div className="lg:pr-10">
                <h3 className="text-3xl mb-3 mt-12">Share & Collaborate</h3>
                <p className="text-lg text-[#999999]">
                  Publish useful queries to the community for open discovery.
                </p>
              </div>
              <div className="relative">
                <Image
                  src="/img/sample.png"
                  width={800}
                  height={512}
                  alt="Write Queroes"
                  className="w-full border-[0.5px] border-[#404040] object-cover rounded-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="  mx-auto mt-4 py-32 text-center pt-8 ">
          <div className="rounded-lg border border-[#ffffff30] w-[70%] mx-auto p-1">
            <div className="py-24 px-8  border-[#ffffff60] border rounded-lg  flex flex-col items-center justify-center">
              <h3 className="text-5xl mb-7 ">Join the Sandworm Community</h3>
              <p className="text-lg lg:px-16 text-[#999999]">
                Join our Discord to discover insights from other analysts, stay
                updated with new features and releases, and be the first to know
                about Sandworm updates.
              </p>
              <Link
                className="border py-3 border-white rounded-full px-12 text-xl  mt-10 font-medium flex items-center"
                href="/"
              >
                <FaDiscord />
                <span className="ml-3">Join</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
