import { useRef } from "react";
import clsx from "clsx";
import {
  PiArchive,
  PiArrowUUpLeft,
  PiEnvelopeSimple,
  PiEnvelopeSimpleOpen,
} from "react-icons/pi";
import {
  ROW_HOVER_CLASSNAME,
  ROW_SELECTED_CLASSNAME,
} from "@sandworm/ui/kit/interactive";
import type { BriefingItemData } from "@sandworm/types/terminal";

import { listTime } from "@/lib/dates";

import { BriefingActionButton } from "./BriefingActionButton";
import { BriefingKindTag } from "./BriefingKindTag";

type BriefingRowProps = {
  item: BriefingItemData;
  isUnread: boolean;
  isArchived: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onToggleRead: () => void;
  onArchive: () => void;
  onRestore: () => void;
};

// One line of the list. An unread item carries its summary and a bold title; a read
// one settles to its title, so what is new stands out when there are many.
export function BriefingRow({
  item,
  isUnread,
  isArchived,
  isSelected,
  onSelect,
  onToggleRead,
  onArchive,
  onRestore,
}: BriefingRowProps) {
  const scroller = useRef<HTMLDivElement>(null);
  // The row slides back once an action has been chosen
  const act = (run: () => void) => () => {
    scroller.current?.scrollTo({ left: 0 });
    run();
  };

  return (
    <div
      ref={scroller}
      className="group relative flex max-lg:snap-x max-lg:snap-mandatory max-lg:overflow-x-auto max-lg:[scrollbar-width:none] lg:block"
    >
      <button
        type="button"
        aria-current={isSelected ? "true" : undefined}
        onClick={onSelect}
        className={clsx(
          ROW_HOVER_CLASSNAME,
          "grid min-h-[64px] w-full max-lg:shrink-0 max-lg:snap-start grid-cols-[10px_minmax(0,1fr)_auto] items-start gap-x-3 px-3 py-3 text-left",
          isSelected && ROW_SELECTED_CLASSNAME
        )}
      >
        <span
          aria-hidden="true"
          className={clsx(
            "mt-1.5 size-2 rounded-full",
            isUnread ? "bg-primary" : "bg-transparent"
          )}
        />
        <span className="flex min-w-0 flex-col gap-1">
          <span className="flex items-center gap-1.5 text-xs text-ink-400">
            <BriefingKindTag kind={item.kind} />
            <span className="truncate">{item.subject}</span>
          </span>
          <span
            className={clsx(
              "line-clamp-2 text-sm",
              isUnread
                ? "font-semibold text-ink-100"
                : "font-medium text-ink-500"
            )}
          >
            {item.title}
          </span>
          {(isUnread || isSelected) && (
            <span className="line-clamp-1 text-[13px] text-ink-400">
              {item.summary}
            </span>
          )}
        </span>
        <span className="whitespace-nowrap text-xs text-ink-400 lg:group-focus-within:invisible lg:group-hover:invisible">
          {listTime(item.publishedAt)}
          {isUnread && <span className="sr-only">, unread</span>}
        </span>
      </button>
      {/* Swiping the row left reveals the same two actions on a touch screen */}
      <div className="flex shrink-0 snap-end lg:hidden">
        <button
          type="button"
          onClick={act(onToggleRead)}
          className="flex w-20 flex-col items-center justify-center gap-1 bg-hover-bg text-xs font-medium text-ink-100"
        >
          {isUnread ? (
            <PiEnvelopeSimpleOpen size={18} aria-hidden />
          ) : (
            <PiEnvelopeSimple size={18} aria-hidden />
          )}
          {isUnread ? "Read" : "Unread"}
        </button>
        <button
          type="button"
          onClick={act(isArchived ? onRestore : onArchive)}
          className="flex w-20 flex-col items-center justify-center gap-1 bg-primary text-xs font-medium text-white"
        >
          {isArchived ? (
            <PiArrowUUpLeft size={18} aria-hidden />
          ) : (
            <PiArchive size={18} aria-hidden />
          )}
          {isArchived ? "Restore" : "Archive"}
        </button>
      </div>
      {/* A pointer can hover for these */}
      <div className="absolute right-2 top-2 hidden items-center gap-0.5 lg:group-focus-within:flex lg:group-hover:flex">
        <BriefingActionButton
          label={isUnread ? "Mark as read" : "Mark as unread"}
          icon={isUnread ? PiEnvelopeSimpleOpen : PiEnvelopeSimple}
          onClick={onToggleRead}
        />
        {isArchived ? (
          <BriefingActionButton
            label="Restore"
            icon={PiArrowUUpLeft}
            onClick={onRestore}
          />
        ) : (
          <BriefingActionButton
            label="Archive"
            icon={PiArchive}
            onClick={onArchive}
          />
        )}
      </div>
    </div>
  );
}
