"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@sandworm/ui/components/badge";

import { SandwormLogo } from "@/components/Assets";

const navLinks = [
  { name: "Explore", href: "workspace/explore" },
  {
    name: "Documentation",
    href: "https://docs.sandwormlabs.xyz",
    isExternal: true,
  },
  {
    name: "Blog",
    href: "https://docs.sandwormlabs.xyz/blog",
    isExternal: true,
  },
  {
    name: "About",
    href: "https://docs.sandwormlabs.xyz/blog",
    isExternal: true,
  },
];

// ⬢ Motion Variants ⬢
const headerContainer = {
  hidden: { opacity: 0, y: -5 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const navItem = {
  hidden: { opacity: 0, y: -5 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  hover: { scale: 1.05, color: "#A308F0", transition: { duration: 0.2 } },
};

export const MainHeader = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed w-full top-5 mx-auto left-0 right-0 z-[99] ">
      <motion.div
        className="w-[85%] mx-auto rounded-xl"
        variants={headerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="px-3 flex justify-between items-center py-2.5">
          {/* Logo */}
          <motion.div variants={navItem} className="flex items-center">
            <Link href="/" className="flex items-center">
              <SandwormLogo />
              <span className="ml-3 font-medium text-xl uppercase text-white">
                Sandw0rm.
              </span>
              <Badge className="bg-white text-black dark:text-black rounded-xl ml-2 font-normal">
                beta
              </Badge>
            </Link>
          </motion.div>

          {/* Desktop Nav Links */}
          <motion.ul
            className="hidden md:flex ml-10 text-[0.8rem]  rounded-full  py-2.5 px-8  glass-container relative"
            variants={headerContainer}
          >
            <div className="glass-filter" />
            <div className="glass-overlay" />
            <div className="glass-specular" />
            <div className="glass-filter" />
            <div className="glass-overlay" />
            <div className="glass-specular" />
            <div className="relative flex space-x-6 items-center">
              {navLinks.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    {...(link.isExternal
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="text-neutral-500 font-medium hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </div>
            <svg style={{ display: "none" }}>
              <filter id="lg-dist" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.008 0.008"
                  numOctaves="2"
                  seed="92"
                  result="noise"
                />
                <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="blurred"
                  scale="70"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </svg>
          </motion.ul>

          {/* Launch App Button */}
          <motion.div variants={navItem} whileHover={{ scale: 1.05 }}>
            <Link
              className="hidden md:flex  py-2 bg-primary text-white rounded-2xl px-4 text-[0.9rem] font-medium"
              href="/workspace"
            >
              Launch App
            </Link>
          </motion.div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            className="md:hidden flex flex-col space-y-1 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div
              className={`w-6 h-0.5 bg-white transition-transform duration-300 ease-in-out ${
                isOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            />
            <div
              className={`w-6 h-0.5 bg-white transition-opacity duration-300 ease-in-out ${
                isOpen ? "opacity-0" : ""
              }`}
            />
            <div
              className={`w-6 h-0.5 bg-white transition-transform duration-300 ease-in-out ${
                isOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            className="md:hidden flex flex-col items-center space-y-4 py-4 bg-black border-t border-borderLight bottom-0"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map(link => (
              <Link
                key={link.name}
                href={link.href}
                {...(link.isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="text-[#999999] hover:text-white text-[0.9rem]"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="workspace/explore"
              className="border py-1.5 bg-white text-black rounded px-4 text-[0.9rem] font-medium"
              onClick={() => setIsOpen(false)}
            >
              Launch App
            </Link>
          </motion.div>
        )}
      </motion.div>
    </header>
  );
};
