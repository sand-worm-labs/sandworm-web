"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import { TerminalFrame } from "./TerminalFrame";
import dynamic from "next/dynamic";

const Parallax = dynamic(
  () => import("../../Parallax").then(mod => mod.Parallax),
  { ssr: false }
);

export const SectionWorkFlow = () => {
  return (
    <section>
      <div className=" mx-auto my-32 py-12 border-t border-b  border-[#FFFFFF20]">
        <h2 className="text-center text-4xl mb-8">How SandWorm Works</h2>
        <div className="  ">
          <div className="py-16 container mx-auto grid lg:grid-cols-2 gap-6">
            <div className="lg:pr-10">
              <h3 className="text-3xl mb-3 mt-12 font-medium">Write Queries</h3>
              <p className="text-lg text-[#999999]">
                Use our SQL-like language to interact with on-chain data
              </p>
              <div className="mt-12 flex space-x-5">
                <Link
                  href="/"
                  className="inline-block font-medium bg-white rounded py-2.5 px-5 text-black text-[0.9rem] "
                >
                  Get Started
                </Link>
                <Link
                  href="/"
                  className=" font-medium rounded py-2.5 px-5  border-borderLight border text-[0.9rem] flex items-center space-x-2"
                >
                  {" "}
                  <span>Learn More</span>
                  <MdOutlineArrowForwardIos />
                </Link>
              </div>
            </div>
            <TerminalFrame>
              <Image
                src="/img/sample.png"
                width={800}
                height={512}
                alt="Write Queries"
                className="w-full object-cover  border border-gray-800"
              />
            </TerminalFrame>
          </div>
        </div>
        <div className="border-t border-b  border-[#FFFFFF20]  ">
          <div className="py-16 container mx-auto grid lg:grid-cols-2 lg:gap-16 gap-5">
            <div className="lg:pr-10">
              <h3 className="text-3xl mb-3 mt-12 font-medium">
                Run & Visualize
              </h3>
              <p className="text-lg text-[#999999]">
                Get real-time insights through our high-performance engine.
              </p>
            </div>
            <TerminalFrame>
              <Image
                src="/img/sample.png"
                width={800}
                height={512}
                alt="Write Queries"
                className="w-full object-cover  border border-gray-800"
              />
            </TerminalFrame>
          </div>
        </div>
        <div className="border-t border-b  border-[#FFFFFF20]  ">
          <div className="py-16 container mx-auto grid lg:grid-cols-2 lg:gap-16 gap-5">
            <div className="lg:pr-10">
              <h3 className="text-3xl mb-3 mt-12 font-medium">
                Share & Collaborate
              </h3>
              <p className="text-lg text-[#999999]">
                Publish useful queries to the community for open discovery.
              </p>
            </div>
            <TerminalFrame>
              <Image
                src="/img/sample.png"
                width={800}
                height={512}
                alt="Write Queries"
                className="w-full object-cover  border border-gray-800"
              />
            </TerminalFrame>
          </div>
        </div>
      </div>
    </section>
  );
};
