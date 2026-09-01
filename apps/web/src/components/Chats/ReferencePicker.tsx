import React, { useState, useEffect, useRef, useCallback } from "react";
import { PiMagnifyingGlass, PiHash } from "react-icons/pi";

import { BlockKindIcon, SourceKindIcon } from "./icons";
import { BLOCK_KIND_META } from "./types";
import type {
  ReferenceItem,
  ReferenceSource,
  AttachedReference,
  BlockReferenceItem,
} from "./types";

// =====================================
// ⬢ Helpers
// =====================================
function filterItems(items: ReferenceItem[], query: string): ReferenceItem[] {
  if (!query.trim()) return items;
  const q = query.toLowerCase();
  return items.filter(
    item =>
      item.label.toLowerCase().includes(q) ||
      (item.preview && item.preview.toLowerCase().includes(q)) ||
      (item.sourceKind === "block" &&
        BLOCK_KIND_META[item.blockKind].label.toLowerCase().includes(q))
  );
}

function toAttachedReference(item: ReferenceItem): AttachedReference {
  return {
    sourceKind: item.sourceKind,
    id: item.id,
    label: item.label,
    blockKind:
      item.sourceKind === "block"
        ? (item as BlockReferenceItem).blockKind
        : undefined,
  };
}

// =====================================
// ⬢ Reference Row
// =====================================
interface ReferenceRowProps {
  item: ReferenceItem;
  isActive: boolean;
  isSelected: boolean;
  onSelect: (item: ReferenceItem) => void;
  onHover: () => void;
}

function ReferenceRow({
  item,
  isActive,
  isSelected,
  onSelect,
  onHover,
}: ReferenceRowProps) {
  const isBlock = item.sourceKind === "block";
  const blockItem = isBlock ? (item as BlockReferenceItem) : null;

  const sublabel = isBlock
    ? BLOCK_KIND_META[blockItem!.blockKind].label
    : item.sourceKind.charAt(0).toUpperCase() + item.sourceKind.slice(1);

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      onMouseEnter={onHover}
      onClick={() => onSelect(item)}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors duration-75
        ${
          isActive
            ? "bg-primary-tint-50 dark:bg-primary-900"
            : "hover:bg-[#DEFCFE] dark:hover:bg-base-730"
        }`}
    >
      <span
        className="flex-shrink-0 flex items-center justify-center w-[26px] h-[26px]
        rounded-md border border-border dark:border-base-710
        bg-white dark:bg-base-720 text-ink-400 dark:text-ink-400"
      >
        {isBlock ? (
          <BlockKindIcon
            kind={blockItem!.blockKind}
            size={13}
            weight="regular"
          />
        ) : (
          <SourceKindIcon kind={item.sourceKind} size={13} weight="regular" />
        )}
      </span>

      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-1.5">
          <span className="text-[12.5px] font-medium text-ink-500 dark:text-ink-200 leading-tight">
            {item.label}
          </span>
          <span className="text-[10px] text-ink-300 dark:text-ink-600 flex-shrink-0">
            {sublabel}
          </span>
        </span>
        {item.preview && (
          <span className="block text-[11px] text-ink-300 dark:text-ink-400 truncate mt-[1px] font-mono leading-tight">
            {item.preview}
          </span>
        )}
      </span>

      {isBlock && (
        <span className="flex-shrink-0 text-[10px] text-ink-300 dark:text-ink-600 tabular-nums">
          #{blockItem!.index}
        </span>
      )}

      {isSelected && (
        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary" />
      )}
    </button>
  );
}

// =====================================
// ⬢ Section Header
// =====================================
function SectionHeader({ source }: { source: ReferenceSource }) {
  return (
    <div className="flex items-center gap-2 px-3 pt-3 pb-1">
      <SourceKindIcon
        kind={source.kind}
        size={11}
        weight="bold"
        className="text-ink-300 dark:text-ink-600"
      />
      <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-300 dark:text-ink-600">
        {source.label}
      </span>
      <div className="flex-1 h-px bg-base-300 dark:bg-base-700" />
      <span className="text-[10px] text-ink-300 dark:text-ink-600">
        {source.items.length}
      </span>
    </div>
  );
}

// =====================================
// ⬢ Empty State
// =====================================
function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <PiHash size={18} className="text-ink-200 dark:text-ink-600" />
      <p className="text-[11.5px] text-ink-300 dark:text-ink-400 text-center">
        {query ? `No results for "${query}"` : "Nothing to reference yet"}
      </p>
    </div>
  );
}

// =====================================
// ⬢ Reference Picker
// =====================================

export interface ReferencePickerProps {
  sources: ReferenceSource[];
  selectedIds: Set<string>;
  onSelect: (ref: AttachedReference) => void;
  onClose: () => void;
}

export function ReferencePicker({
  sources,
  selectedIds,
  onSelect,
  onClose,
}: ReferencePickerProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const searchRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSources: ReferenceSource[] = sources
    .map(source => ({
      ...source,
      items: filterItems(source.items, query),
    }))
    .filter(s => s.items.length > 0);

  const flatItems: ReferenceItem[] = filteredSources.flatMap(s => s.items);
  const totalCount = sources.reduce((n, s) => n + s.items.length, 0);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex(i => Math.min(i + 1, flatItems.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex(i => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (flatItems[activeIndex]) handleSelect(flatItems[activeIndex]);
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        default:
          break;
      }
    },
    [flatItems, activeIndex, onClose]
  );

  function handleSelect(item: ReferenceItem) {
    onSelect(toAttachedReference(item));
    onClose();
  }

  let nextIndex = 0;

  return (
    <div
      ref={containerRef}
      role="listbox"
      aria-label="Reference picker"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="absolute bottom-[calc(100%+6px)] left-0 right-0 z-50 flex flex-col
        bg-white dark:bg-dropdown-bg
        border border-border-tertiary
        rounded-2xl
        shadow-[0_-2px_16px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.10)]
        overflow-hidden"
      style={{ maxHeight: "272px" }}
    >
      <div
        className="flex items-center gap-2 px-3 py-2.5
        border-b border-base-300 dark:border-base-700"
      >
        <PiMagnifyingGlass
          size={13}
          className="text-ink-300 dark:text-ink-600 flex-shrink-0"
        />
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          placeholder="Search blocks, dataframes, files…"
          className="flex-1 bg-transparent outline-none text-[12.5px]
            text-ink-500 dark:text-ink-200
            placeholder:text-ink-300 dark:placeholder:text-ink-600"
        />
        {totalCount > 0 && (
          <span className="text-[10px] text-ink-300 dark:text-ink-600 flex-shrink-0 tabular-nums">
            {totalCount}
          </span>
        )}
      </div>

      <div className="overflow-y-auto flex-1">
        {flatItems.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          filteredSources.map(source => {
            const startIndex = nextIndex;
            nextIndex += source.items.length;
            return (
              <div key={source.kind}>
                {sources.length > 1 && <SectionHeader source={source} />}
                {source.items.map((item, i) => {
                  const idx = startIndex + i;
                  return (
                    <ReferenceRow
                      key={item.id}
                      item={item}
                      isActive={idx === activeIndex}
                      isSelected={selectedIds.has(item.id)}
                      onSelect={handleSelect}
                      onHover={() => setActiveIndex(idx)}
                    />
                  );
                })}
              </div>
            );
          })
        )}
      </div>

      <div
        className="flex items-center gap-3 px-3 py-2
        border-t border-base-300 dark:border-base-700"
      >
        {(["↑↓ navigate", "↵ select", "esc close"] as const).map(hint => (
          <span
            key={hint}
            className="text-[10px] text-ink-300 dark:text-ink-600 font-mono"
          >
            {hint}
          </span>
        ))}
      </div>
    </div>
  );
}
