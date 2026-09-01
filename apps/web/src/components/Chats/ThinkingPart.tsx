"use client";

import React, { useState, useEffect } from "react";
import { PiBrain, PiCaretRight } from "react-icons/pi";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { BlockType } from "@sandworm/editor";

import { BlockKindIcon } from "./icons";
import type { ThinkingPart as ThinkingPartType } from "./parts.types";
import { useTypewriter } from "./useTypewriter";

// =====================================
// ⬢ Constants
// =====================================

const BLOCK_TYPE_TO_KIND: Record<string, BlockType> = {
  SQL: BlockType.SQL,
  PYTHON: BlockType.Python,
  MARKDOWN: BlockType.Markdown,
  VISUALIZATION: BlockType.VisualizationV2,
  VISUALIZATION_V2: BlockType.VisualizationV2,
  POWER_TOOLBOX: BlockType.PowerToolbox,
  RICH_TEXT: BlockType.RichText,
  PIVOT_TABLE: BlockType.PivotTable,
};

const BODY_VARIANTS = {
  hidden: {
    height: 0,
    opacity: 0,
  },
  visible: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
      opacity: { duration: 0.18, delay: 0.06 },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.22, ease: [0.4, 0, 1, 1] },
      opacity: { duration: 0.12 },
    },
  },
};

// =====================================
// ⬢ ThinkingDots
// =====================================

function ThinkingDots() {
  return (
    <span
      className="inline-flex items-center gap-[3.5px] ml-[5px] mb-[1px]"
      aria-hidden
    >
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="block w-[3px] h-[3px] rounded-full bg-[#7F77DD]"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.22,
            ease: "easeInOut",
            repeatType: "loop",
          }}
        />
      ))}
    </span>
  );
}

// =====================================
// ⬢ ThinkingPart
// =====================================

interface ThinkingPartProps {
  part: ThinkingPartType;
  isActive?: boolean;
}

export function ThinkingPart({ part, isActive = false }: ThinkingPartProps) {
  const [open, setOpen] = useState(isActive);
  const displayedThinking = useTypewriter(part.thinking, isActive);

  const seconds = Math.round(part.duration_ms / 1000);
  const label = seconds >= 1 ? `Thought for ${seconds}s` : "Thought";

  useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);

  return (
    <div
      className="rounded-lg border border-border-secondary dark:border-base-700
        bg-white dark:bg-base-730 overflow-hidden"
    >
      <button
        type="button"
        onClick={() => {
          if (!isActive) setOpen(v => !v);
        }}
        className={clsx(
          "w-full flex items-center gap-2 px-2.5 py-1.5 text-left",
          "transition-colors duration-150",
          !isActive && "hover:bg-[#F9F9F9] dark:hover:bg-[#222220]",
          isActive && "cursor-default select-none"
        )}
      >
        <motion.span
          animate={isActive ? { opacity: [0.6, 1, 0.6] } : { opacity: 1 }}
          transition={
            isActive
              ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.2 }
          }
          className="flex-shrink-0 leading-none"
        >
          <PiBrain size={13} className="text-[#7F77DD]" />
        </motion.span>

        <span className="text-[12.5px] text-ink-400 dark:text-ink-300 flex-1 font-semibold flex items-center">
          <AnimatePresence mode="wait" initial={false}>
            {isActive ? (
              <motion.span
                key="thinking"
                className="flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                Thinking
                <ThinkingDots />
              </motion.span>
            ) : (
              <motion.span
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </span>

        <AnimatePresence>
          {!isActive && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-shrink-0"
            >
              <PiCaretRight
                size={10}
                className={clsx(
                  "text-ink-300 dark:text-ink-600 transition-transform duration-200",
                  open && "rotate-90"
                )}
              />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            variants={BODY_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ overflow: "hidden" }}
          >
            <div className="border-t border-border-secondary dark:border-base-700 px-2.5 py-2 space-y-2">
              {part.contextUsed && part.contextUsed.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {part.contextUsed.map(ctx => {
                    const kind =
                      BLOCK_TYPE_TO_KIND[
                        ctx.blockType.toUpperCase().replace(/ /g, "_")
                      ];
                    return (
                      <span
                        key={ctx.blockId}
                        className="inline-flex items-center gap-1 text-[10.5px] font-medium
                          px-1.5 py-[2px] rounded-md
                          bg-base-300 dark:bg-base-700
                          border border-border dark:border-base-710
                          text-ink-400 dark:text-ink-400"
                      >
                        {kind && (
                          <BlockKindIcon
                            kind={kind}
                            size={10}
                            weight="bold"
                            className="opacity-60"
                          />
                        )}
                        {ctx.blockTitle}
                      </span>
                    );
                  })}
                </div>
              )}

              <p className="text-[12.5px] text-ink-400 dark:text-ink-300 leading-relaxed">
                {displayedThinking}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
