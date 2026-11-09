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
  return (
    <div className="group relative">
      <button
        type="button"
        aria-current={isSelected ? "true" : undefined}
        onClick={onSelect}
        className={clsx(
          ROW_HOVER_CLASSNAME,
          "grid min-h-[64px] w-full grid-cols-[10px_minmax(0,1fr)_auto] items-start gap-x-3 px-3 py-3 text-left",
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
      {/* A pointer can hover for these; a phone has them on the item's own page */}
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
