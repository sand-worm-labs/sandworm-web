import Image from "next/image";
import Link from "next/link";

import MainLayout from "@/layouts/MainLayout/MainLayout";

import { FaDiscord } from "react-icons/fa";
import { SandwormLogo } from "@/components/Assets/SandwormLogo";

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
      <section className="p-8 flex flex-col h-full justify-center items-center text-center min-h-[80vh]">
        <p className="text-xl font-medium">Welcome to</p>
        <h1 className="text-[6.5rem] font-medium uppercase tracking-wider leading-[1.3] ">
          Sandw0rm
        </h1>
        <p className="text-[#DBDBDBCC] mt-3  max-w-[45rem]">
          The simplest way to analyze and explore the Sui blockchain with a
          SQL-like query language, high-performance engine, and community-driven
          insights.
        </p>
      </section>
      <section>
        <div className="container mx-auto py-16">
          <div className="grid grid-cols-3 gap-12 pl-[6rem]">
            <div className="text-4xl font-medium leading-[1.6] flex items-center">
              <p className="ml-[-6rem]">
                What Makes <br />
                <span className="text-[#BA603F]"> Sandworm Unique</span>
              </p>
            </div>
            <div className="border border-[#FFFFFF50] p-5 py-8">
              <h2 className="font-medium text-2xl min-h-[14rem]">01.</h2>
              <p className="text-sm text-[#DBDBDB]">
                Designed for deep insights into the Sui blockchain, with
                Ethereum support and more chains in the future
              </p>
            </div>
            <div className="border border-[#FFFFFF50] p-5 py-8">
              <h2 className="font-medium text-2xl min-h-[14rem]">02.</h2>
              <p className="text-sm text-[#DBDBDB]">
                Designed for deep insights into the Sui blockchain, with
                Ethereum support and more chains in the future
              </p>
            </div>
            <div className="border border-[#FFFFFF50] p-5 py-8">
              <h2 className="font-medium text-2xl min-h-[14rem]">03.</h2>
              <p className="text-sm text-[#DBDBDB]">
                Designed for deep insights into the Sui blockchain, with
                Ethereum support and more chains in the future
              </p>
            </div>
            <div className="border border-[#FFFFFF50] p-5 py-8">
              <h2 className="font-medium text-2xl min-h-[14rem]">04.</h2>
              <p className="text-sm text-[#DBDBDB]">
                Designed for deep insights into the Sui blockchain, with
                Ethereum support and more chains in the future
              </p>
            </div>
            <div className="border border-[#FFFFFF50] p-5 py-8">
              <h2 className="font-medium text-2xl min-h-[14rem]">05.</h2>
              <p className="text-sm text-[#DBDBDB]">
                Designed for deep insights into the Sui blockchain, with
                Ethereum support and more chains in the future
              </p>
            </div>
          </div>
        </div>
      </section>

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
                  width={434}
                  height={257}
                  alt="Write Queroes"
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <div className="border-t border-b  border-[#FFFFFF20]  ">
            <div className="py-16 container mx-auto grid lg:grid-cols-2 lg:gap-16 gap-5">
              <div className="relative">
                <Image
                  src="/img/sample.png"
                  width={434}
                  height={257}
                  alt="Write Queroes"
                  className="w-full"
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
                  width={434}
                  height={257}
                  alt="Write Queroes"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-col items-center justify-center w-[60%] mx-auto mt-4 py-32 text-center">
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
      </section>
    </MainLayout>
  );
}
