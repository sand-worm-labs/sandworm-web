import React from "react";
import Link from "next/link";
import { FaGithub, FaDiscord } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function Contact() {
  return (
    <section className="flex flex-col justify-center h-full line-bg">
      <div className="grid-overlay" />
      <div className="container mx-auto grid lg:grid-cols-2  justify-center pt-20 gap-x-12 content">
        <div className="">
          <h2 className="text-3xl font-medium mb-4 lg:pr-8 leading-[1.6]">
            Have feedback or an issue? <br /> Let us know!
          </h2>
          <p className="pr-12 leading-[1.6] text-text-gray">
            Help us improve Sandworm by reporting issues or <br /> sharing your
            insights.
          </p>
          <div className="flex space-x-6 mt-10">
            <Link
              href="https://github.com/sand-worm-sql"
              className="hover:text-white"
            >
              <FaGithub size={20} />
            </Link>
            <Link
              href="https://discord.gg/pftQtpcjK2"
              className="hover:text-white"
              target="blank_"
            >
              <FaDiscord size={20} />
            </Link>
            <Link href="/" className="hover:text-white">
              <FaXTwitter size={20} />
            </Link>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center">
          <form className="border border-[#ffffff30] p-6 py-12 flex flex-col gap-4 rounded-md md:w-[85%]">
            <input
              type="text"
              placeholder="Your Name"
              className="mt-1 w-full rounded-md  bg-[#1A1A1A]  p-2 text-white focus:border-orange-500 focus:ring-orange-500 px-3"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="mt-1 w-full rounded-md  bg-[#1A1A1A]  p-2 text-white focus:border-orange-500 focus:ring-orange-500 px-3"
            />
            <textarea
              placeholder="Your Message"
              className="mt-1 w-full rounded-md  bg-[#1A1A1A]  p-2 text-white focus:border-orange-500 focus:ring-orange-500 px-3"
            />
            <button
              type="button"
              className="w-full rounded-md bg-orange-600 px-4 py-3 text-white font-medium disabled:bg-orange-300 mt-5"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
