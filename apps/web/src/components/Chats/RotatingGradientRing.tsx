import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { CHAIN_VERBS, pickNextVerb } from "./chainVerbs";

const styleSheet = `
@keyframes spin-continuous {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.spin-ring {
  animation: spin-continuous 1s linear infinite;
}
`;

const VERB_INTERVAL_MS = 2200;

interface RotatingGradientRingProps {
  size?: number;
  // "inline": small, left-aligned, no background — sits next to a chat
  //   message or other content. Default, since that's the only current use.
  // "page": large, centered in a full-size white box — for full-page/panel
  //   loading states. Matches this component's original look.
  variant?: "inline" | "page";
  // Cycles a whimsical "Indexing blocks…"-style label next to the ring.
  // Off by default so existing bare usages of the ring are unaffected.
  showLabel?: boolean;
}

export default function RotatingGradientRing({
  size,
  variant = "inline",
  showLabel = false,
}: RotatingGradientRingProps) {
  const resolvedSize = size ?? (variant === "page" ? 96 : 20);

  const [verb, setVerb] = useState(
    () => CHAIN_VERBS[Math.floor(Math.random() * CHAIN_VERBS.length)] ?? ""
  );

  useEffect(() => {
    if (!showLabel) return undefined;
    const id = setInterval(() => {
      setVerb(current => pickNextVerb(current));
    }, VERB_INTERVAL_MS);
    return () => clearInterval(id);
  }, [showLabel]);

  const containerClassName =
    variant === "page"
      ? "w-full h-full flex items-center justify-center bg-white p-16 gap-2"
      : "inline-flex items-center justify-start self-start w-fit gap-2";

  return (
    <div className={containerClassName}>
      <style>{styleSheet}</style>
      <svg
        className="spin-ring flex-shrink-0"
        width={resolvedSize}
        height={resolvedSize}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM2.08708 8C2.08708 11.2656 4.73438 13.9129 8 13.9129C11.2656 13.9129 13.9129 11.2656 13.9129 8C13.9129 4.73438 11.2656 2.08708 8 2.08708C4.73438 2.08708 2.08708 4.73438 2.08708 8Z"
          fill="url(#paint0_radial_5703_136935)"
        />
        <defs>
          <radialGradient
            id="paint0_radial_5703_136935"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(8.75 7.5) rotate(135) scale(9.54594 9.7989)"
          >
            <stop stopColor="#A308F0" />
            <stop offset="0.658654" stopColor="#7BFF42" />
            <stop offset="0.658754" stopColor="#B8B3FA" />
            <stop offset="0.745192" stopColor="#2DB2FF" />
            <stop offset="0.826923" stopColor="#FF0000" />
            <stop offset="0.908654" stopColor="#DED757" />
            <stop offset="1" stopColor="#A308F0" />
          </radialGradient>
        </defs>
      </svg>

      {showLabel && (
        <span className="text-[12.5px] text-ink-400 dark:text-ink-400 font-semibold overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={verb}
              className="inline-block"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              {verb}…
            </motion.span>
          </AnimatePresence>
        </span>
      )}
    </div>
  );
}
