import { motion } from "framer-motion";
import Link from "next/link";

import { MessageIcon, VercelIcon } from "./icons";
import { WormIcon } from "../Ai/icons";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-[500px] mt-20 mx-4 md:mx-0"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="dark border-none bg-white/5 border border-white text-white rounded-2xl p-6 flex flex-col gap-4 text-sm dark:text-zinc-400 dark:border-zinc-700">
        <p className="flex flex-row justify-center gap-4 items-center text-zinc-900 dark:text-zinc-50">
          <WormIcon />
          <span>+</span>
          <MessageIcon />
        </p>
        <p>
          Worm AI is built for exploring blockchain data like never before. Just
          ask anything you want to know onchain and get answers, insights, and
          analysis. All powered by
          <code className="rounded-sm bg-muted-foreground/15 px-1.5 py-0.5">
            Sandworm’s WQL
          </code>{" "}
          engine. We’re still in active development, so answers might not always
          be perfect. But Worm is getting smarter fast —and you’re early enough
          to help shape what it becomes.
        </p>
        <p>
          {" "}
          You can learn more about how to prompt better by visiting the{" "}
          <Link
            className="text-orange-500 dark:text-orange-400"
            href="https://sdk.vercel.ai/docs"
            target="_blank"
          >
            Docs
          </Link>
          .
        </p>
      </div>
    </motion.div>
  );
};
