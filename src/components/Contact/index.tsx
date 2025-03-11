"use client";

import Link from "next/link";
import { FaGithub, FaDiscord } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import { ContactForm } from "./ContactForm";

export const Contact = () => {
  return (
    <section className="flex flex-col justify-center h-full line-bg">
      <div className="grid-overlay" />
      <div className="container mx-auto grid lg:grid-cols-2 justify-center pt-20 gap-x-12 content">
        <div>
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
              target="_blank"
            >
              <FaDiscord size={20} />
            </Link>
            <Link href="/" className="hover:text-white">
              <FaXTwitter size={20} />
            </Link>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center">
          <ContactForm />
        </div>
      </div>
    </section>
  );
};
