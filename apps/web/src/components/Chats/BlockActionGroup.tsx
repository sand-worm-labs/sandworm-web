"use client";

import React, { useState } from "react";

import { BlockActionRow } from "./BlockActionRow";
import type { BlockActionPart } from "./parts.types";

// =====================================
// ⬢ Constants
// =====================================

const INITIAL_VISIBLE = 3;

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
      {visible.map((part, i) => (
        <BlockActionRow
          // eslint-disable-next-line react/no-array-index-key
          key={`${part.blockId}-${part.action}-${i}`}
          part={part}
        />
      ))}

      {!expanded && hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-[10.5px] text-ink-300 dark:text-ink-600
            hover:text-ink-400 dark:hover:text-ink-500
            text-left px-1 transition-colors"
        >
          +{hidden} more
        </button>
      )}

      {expanded && parts.length > INITIAL_VISIBLE && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-[10.5px] text-ink-300 dark:text-ink-600
            hover:text-ink-400 dark:hover:text-ink-500
            text-left px-1 transition-colors"
        >
          show less
        </button>
      )}
    </div>
  );
}
