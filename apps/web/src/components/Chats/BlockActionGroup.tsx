"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { BlockActionRow } from "./BlockActionRow";
import type { BlockActionPart } from "./parts.types";

// =====================================
// ⬢ Constants
// =====================================

const INITIAL_VISIBLE = 3;

// =====================================
// ⬢ Animation variants
// =====================================

// Each row slides in from slightly above, fades in.
// custom(i) = index drives the stagger delay.
const ROW_VARIANTS = {
  hidden: {
    opacity: 0,
    y: -5,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      delay: i * 0.045,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
  exit: {
    opacity: 0,
    y: -3,
    transition: {
      duration: 0.14,
      ease: [0.4, 0, 1, 1] as [number, number, number, number],
    },
  },
};

const TOGGLE_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

// =====================================
// ⬢ BlockActionGroup
// =====================================

interface BlockActionGroupProps {
  parts: BlockActionPart[];
}

export function BlockActionGroup({ parts }: BlockActionGroupProps) {
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? parts : parts.slice(0, INITIAL_VISIBLE);
  const hidden = parts.length - INITIAL_VISIBLE;

  return (
    <div className="flex flex-col gap-1">
      <AnimatePresence mode="popLayout" initial={false}>
        {/* ─── Rows ─── */}
        {visible.map((part, i) => (
          <motion.div
            key={`${part.blockId}-${part.action}`}
            variants={ROW_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            custom={i}
            layout="position"
          >
            <BlockActionRow part={part} />
          </motion.div>
        ))}

        {/* ─── Expand ─── */}
        {!expanded && hidden > 0 && (
          <motion.button
            key="show-more"
            type="button"
            onClick={() => setExpanded(true)}
            variants={TOGGLE_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-[10.5px] text-ink-300 dark:text-ink-600
              hover:text-ink-400 dark:hover:text-ink-100
              text-left px-1 transition-colors duration-150"
          >
            +{hidden} more
          </motion.button>
        )}

        {/* ─── Collapse ─── */}
        {expanded && parts.length > INITIAL_VISIBLE && (
          <motion.button
            key="show-less"
            type="button"
            onClick={() => setExpanded(false)}
            variants={TOGGLE_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-[10.5px] text-ink-300 dark:text-ink-600
              hover:text-ink-400 dark:hover:text-ink-100
              text-left px-1 transition-colors duration-150"
          >
            show less
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
