"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import { FaCheck } from "react-icons/fa";

import { TerminalFrame } from "./TerminalFrame";

gsap.registerPlugin(ScrollTrigger);

export const SectionWorkFlow = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || !leftContentRef.current) {
      return undefined;
    }

    const ST = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      pin: leftContentRef.current,
    });

    return () => {
      ST.kill();
    };
  }, []);

  return (
    <div className="container mx-auto mt-16">
      <h2 className="text-center text-4xl mb-8">How SandWorm Works</h2>

      <div ref={containerRef} className="content-container flex">
        <div className="right-content w-2/3 p-4 pb-[6rem]">
          <section className="h-screen flex justify-center items-center">
            <div className="lg:pr-10">
              <h3 className="text-3xl mb-3 mt-12 font-medium">Write Queries</h3>
              <p className="text-lg text-[#999999] mb-3">
                Publish useful queries to the community for open discovery.
              </p>

              <div className="mt-12 flex space-x-5">
                <Link
                  href="/"
                  className="inline-block font-medium bg-orange-600 rounded py-2.5 px-5 text-white text-[0.9rem] "
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
              <ul className=" text-sm mt-12">
                <li className="mb-4 flex items-center space-x-3">
                  <span className="rounded-full  mr-3  bg-dark-translucent p-1">
                    <FaCheck className="text-orange-600 text-[0.65rem]" />
                  </span>{" "}
                  Use an SQL-like language designed for on-chain data
                </li>
                <li className="mb-4 flex items-center space-x-3">
                  <span className="rounded-full  mr-3  bg-dark-translucent p-1">
                    <FaCheck className="text-orange-600 text-[0.65rem]" />
                  </span>{" "}
                  Filter and sort transactions without the headache
                </li>
                <li className="mb-4 flex items-center space-x-3">
                  <span className="rounded-full  mr-3  bg-dark-translucent p-1">
                    <FaCheck className="text-orange-600 text-[0.65rem] " />
                  </span>{" "}
                  Pull Sui real-time or historical data{" "}
                </li>
              </ul>
            </div>
          </section>
          <section className="h-screen flex justify-center items-center">
            <div className="lg:pr-10">
              <h3 className="text-3xl mb-3 mt-12 font-medium">
                {" "}
                Share & Collaborate
              </h3>
              <p className="text-lg text-[#999999] mb-3">
                Publish useful queries to the community for open discovery.
              </p>

              <div className="mt-12 flex space-x-5">
                <Link
                  href="/"
                  className="inline-block font-medium  rounded py-2.5 px-5  text-[0.9rem] bg-orange-600 text-white "
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
              <ul className=" text-sm mt-12">
                <li className="mb-4 flex items-center space-x-3">
                  <span className="rounded-full  mr-3   bg-dark-translucent p-1">
                    <FaCheck className="text-orange-600 text-[0.65rem]" />
                  </span>{" "}
                  Use an SQL-like language designed for on-chain data
                </li>
                <li className="mb-4 flex items-center space-x-3">
                  <span className="rounded-full  mr-3   bg-dark-translucent p-1">
                    <FaCheck className="text-orange-600 text-[0.65rem]" />
                  </span>{" "}
                  Filter and sort transactions without the headache
                </li>
                <li className="mb-4 flex items-center space-x-3">
                  <span className="rounded-full  mr-3   bg-dark-translucent p-1">
                    <FaCheck className="text-orange-600 text-[0.65rem] " />
                  </span>{" "}
                  Pull Sui real-time or historical data{" "}
                </li>
              </ul>
            </div>
          </section>
          <section className="h-screen flex justify-center items-center">
            <div className="lg:pr-10">
              <h3 className="text-3xl mb-3 mt-12 font-medium">
                {" "}
                Share & Collaborate
              </h3>
              <p className="text-lg text-[#999999] mb-3">
                Publish useful queries to the community for open discovery.
              </p>

              <div className="mt-12 flex space-x-5">
                <Link
                  href="/"
                  className="inline-block font-medium rounded py-2.5 px-5 text-white text-[0.9rem] bg-orange-600 "
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
              <ul className=" text-sm mt-12">
                <li className="mb-4 flex items-center space-x-3">
                  <span className="rounded-full  mr-3   bg-dark-translucent p-1">
                    <FaCheck className="text-orange-600 text-[0.65rem]" />
                  </span>{" "}
                  Use an SQL-like language designed for on-chain data
                </li>
                <li className="mb-4 flex items-center space-x-3">
                  <span className="rounded-full  mr-3   bg-dark-translucent p-1">
                    <FaCheck className="text-orange-600 text-[0.65rem]" />
                  </span>{" "}
                  Filter and sort transactions without the headache
                </li>
                <li className="mb-4 flex items-center space-x-3">
                  <span className="rounded-full  mr-3   bg-dark-translucent p-1">
                    <FaCheck className="text-orange-600 text-[0.65rem] " />
                  </span>{" "}
                  Pull Sui real-time or historical data{" "}
                </li>
              </ul>
            </div>
          </section>
        </div>

        {/*  */}
        <div
          ref={leftContentRef}
          className="left-content items-center w-1/3 p-4 pt-[5rem] justify-center flex"
        >
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
  );
};
