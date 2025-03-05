import Link from "next/link";
import { FaDiscord } from "react-icons/fa";

import MainLayout from "@/layouts/MainLayout/MainLayout";
import { SandwormLogo } from "@/components/Assets/SandwormLogo";
import { SectionFeatures } from "@/components/Sections/SectionFeatures";
import { SectionHero } from "@/components/Sections/SectionHero";
import { SectionWorkFlow } from "@/components/Sections/SectionWorkFlow";

export default function Home() {
  return (
    <MainLayout>
      <header>
        <div className="px-8 flex justify-between items-center py-3  border-b border-borderLight">
          <div className="flex items-center">
            <Link href="/" className="flex items-center ">
              <SandwormLogo />
              <span className="ml-3 font-medium text-xl uppercase">
                Sandw0rm.
              </span>
            </Link>
            <ul className="md:ml-10 text-[0.9rem] flex items-center space-x-8">
              <li>
                <Link
                  href="/explore"
                  className="text-[#999999] hover:text-white"
                >
                  Explore
                </Link>
              </li>
              <li>
                <Link
                  href="/explore"
                  className="text-[#999999] hover:text-white"
                >
                  Docs
                </Link>
              </li>
              <li>
                <Link
                  href="/explore"
                  className="text-[#999999] hover:text-white"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <Link
            className="border py-1.5 bg-white text-black rounded px-4 text-[0.9rem]  font-medium  items-center"
            href="/explore"
          >
            <span>Launch App</span>
          </Link>
        </div>
      </header>
      <SectionHero />
      <SectionFeatures />
      <SectionWorkFlow />

      <section className="line-bg mt-16 mb-16">
        <div className="grid-overlay" />
        <div className="  mx-auto mt-4 py-16 text-center pt-8 content ">
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
