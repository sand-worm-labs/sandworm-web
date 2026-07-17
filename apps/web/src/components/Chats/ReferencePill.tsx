import React from "react";
import { PiX } from "react-icons/pi";

import { BlockKindIcon, SourceKindIcon } from "./icons";
import type { AttachedReference } from "./types";

// =====================================
// ⬢ Shared pill classes
// =====================================

export const PILL_BASE =
  "inline-flex items-center gap-1 font-medium leading-none rounded-[5px] bg-primary-tint-75 ";

export const PILL_TEXT_CLASS = "text-ink-450";

export const PILL_ICON_CLASS = "flex-shrink-0 text-primary";

export const PILL_CANCEL_CLASS =
  "flex items-center justify-center w-3.5 h-3.5 ml-0.5 rounded " +
  "text-ink-300 hover:text-ink-500 hover:bg-input dark:hover:bg-base-710 " +
  "transition-colors";

// =====================================
// ⬢ Utils
// =====================================

function dispatchScrollToBlock(blockId: string) {
  window.dispatchEvent(
    new CustomEvent<{ blockId: string }>("editor:scroll-to-block", {
      detail: { blockId },
    })
  );
}

// =====================================
// ⬢ Input Pill
// =====================================

interface InputPillProps {
  reference: AttachedReference;
  onRemove: (id: string) => void;
}

export function InputReferencePill({ reference, onRemove }: InputPillProps) {
  return (
    <span
      className={` ${PILL_BASE} ${PILL_TEXT_CLASS} text-[11px] pl-1.5 pr-1 py-[2.5px]`}
    >
      {reference.blockKind ? (
        <BlockKindIcon
          kind={reference.blockKind}
          size={12}
          weight="bold"
          className={PILL_ICON_CLASS}
        />
      ) : (
        <SourceKindIcon
          kind={reference.sourceKind}
          size={12}
          weight="bold"
          className={PILL_ICON_CLASS}
        />
      )}

      <span className="max-w-[130px] truncate">{reference.label}</span>

      <button
        type="button"
        onClick={() => onRemove(reference.id)}
        aria-label={`Remove ${reference.label}`}
        className={PILL_CANCEL_CLASS}
      >
        <PiX size={10} />
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
  const inner = (
    <>
      {reference.blockKind ? (
        <BlockKindIcon
          kind={reference.blockKind}
          size={12}
          weight="bold"
          className={PILL_ICON_CLASS}
        />
      ) : (
        <SourceKindIcon
          kind={reference.sourceKind}
          size={12}
          weight="bold"
          className={PILL_ICON_CLASS}
        />
      )}
      <span>{reference.label}</span>
    </>
  );

  if (reference.sourceKind === "block") {
    return (
      <button
        type="button"
        onClick={() => dispatchScrollToBlock(reference.id)}
        className={`${PILL_BASE} ${PILL_TEXT_CLASS} text-[10.5px] px-1.5 py-[2.5px]
          cursor-pointer hover:bg-[#EAECEE] dark:hover:bg-[#333330]
          transition-colors duration-150`}
      >
        {inner}
      </button>
    );
  }

  return (
    <span
      className={`${PILL_BASE} ${PILL_TEXT_CLASS} text-[10.5px] px-1.5 py-[2.5px]`}
    >
      {inner}
    </span>
  );
}
