import React from "react";
import { PiX } from "react-icons/pi";

import { BlockKindIcon, SourceKindIcon } from "./icons";
import type { AttachedReference } from "./types";

// =====================================
// ⬢ Shared pill classes
// =====================================

const PILL_BASE =
  "inline-flex items-center gap-1 font-medium leading-none rounded-md " +
  "bg-[#F1F3F4] dark:bg-[#2A2A28] " +
  "border border-[#DEE2E6] dark:border-[#3A3A38] " +
  "text-ink-500 dark:text-ink-300 ";

// =====================================
// ⬢ Input Pill
// =====================================
interface InputPillProps {
  reference: AttachedReference;
  onRemove: (id: string) => void;
}

export function InputReferencePill({ reference, onRemove }: InputPillProps) {
  return (
    <span className={`${PILL_BASE} text-[11px] pl-1.5 pr-1 py-[3px]`}>
      {reference.blockKind ? (
        <BlockKindIcon
          kind={reference.blockKind}
          size={11}
          weight="bold"
          className="flex-shrink-0 opacity-60"
        />
      ) : (
        <SourceKindIcon
          kind={reference.sourceKind}
          size={11}
          weight="bold"
          className="flex-shrink-0 opacity-60"
        />
      )}

      <span className="max-w-[130px] truncate">{reference.label}</span>

      <button
        type="button"
        onClick={() => onRemove(reference.id)}
        aria-label={`Remove ${reference.label}`}
        className="flex items-center justify-center w-3.5 h-3.5 ml-0.5
          rounded opacity-40 hover:opacity-80 hover:bg-[#DEE2E6] dark:hover:bg-[#3A3A38]
          transition-opacity"
      >
        <PiX size={9} />
      </button>
    </span>
  );
}

// =====================================
// ⬢ Bubble Pill
// =====================================
interface BubblePillProps {
  reference: AttachedReference;
}

export function BubbleReferencePill({ reference }: BubblePillProps) {
  return (
    <span className={`${PILL_BASE} text-[10.5px] px-1.5 py-[3px]`}>
      {reference.blockKind ? (
        <BlockKindIcon
          kind={reference.blockKind}
          size={10}
          weight="bold"
          className="flex-shrink-0 opacity-60"
        />
      ) : (
        <SourceKindIcon
          kind={reference.sourceKind}
          size={10}
          weight="bold"
          className="flex-shrink-0 opacity-60"
        />
      )}
      <span>{reference.label}</span>
    </span>
  );
}
