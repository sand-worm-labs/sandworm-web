"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaGithub, FaDiscord } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import { SandwormLogo } from "../../Assets/SandwormLogo";

export const MainFooter = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const bottomBarVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const socialVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.6 + i * 0.1,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  return (
    <footer className="p-4 px-5 lg:text-sm text-base text-white border-t bg-black font-primary font-medium z-10 relative">
      <motion.div
        className="container mx-auto grid lg:grid-cols-3 pt-5 pb-8 gap-y-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <motion.div
          className="col-span-full lg:col-span-1"
          variants={itemVariants}
        >
          <Link href="/" className="flex items-center">
            <SandwormLogo />
            <span className="ml-3 font-medium text-xl uppercase">
              Sandw0rm.
            </span>
          </Link>
        </motion.div>
        <motion.div className="flex space-y-4 flex-col" variants={itemVariants}>
          <span className="font-medium mb-1">Resources</span>
          <Link
            href="https://docs.sandwormlabs.xyz"
            className="hover:text-white"
            target="blank_"
          >
            Docs
          </Link>
          <Link
            href="https://docs.sandwormlabs.xyz/blog"
            className="hover:text-white"
            target="blank_"
          >
            Blog
          </Link>
          <Link
            href="https://github.com/sand-worm-labs"
            target="blank_"
            className="hover:text-white"
          >
            CLI
          </Link>
        </motion.div>
        <motion.div className="flex space-y-4 flex-col" variants={itemVariants}>
          <span className="font-medium mb-1">Product</span>

          <Link href="/terms">Terms & Conditions</Link>
          <Link href="/contact">Contact Us</Link>
        </motion.div>
      </motion.div>
      <motion.div
        className="mx-auto container flex justify-between py-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={bottomBarVariants}
      >
        <div>© Sandworm 2025</div>
        <div>
          <div className="flex space-x-6">
            <motion.div
              custom={0}
              variants={socialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ scale: 1.2, transition: { duration: 0.2 } }}
            >
              <Link
                href="https://github.com/sand-worm-labs"
                target="blank_"
                className="hover:text-white"
              >
                <FaGithub size={20} />
              </Link>
            </motion.div>
            <motion.div
              custom={1}
              variants={socialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ scale: 1.2, transition: { duration: 0.2 } }}
            >
              <Link
                href="https://discord.gg/pftQtpcjK2"
                className="hover:text-white"
                target="blank_"
              >
                <FaDiscord size={20} />
              </Link>
            </motion.div>
            <motion.div
              custom={2}
              variants={socialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ scale: 1.2, transition: { duration: 0.2 } }}
            >
              <Link
                href="https://x.com/sandwormlabs"
                className="hover:text-white"
                target="blank_"
              >
                <FaXTwitter size={20} />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
};
