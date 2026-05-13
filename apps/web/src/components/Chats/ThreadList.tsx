import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  PiMagnifyingGlass,
  PiPushPin,
  PiPushPinSlash,
  PiPencilSimple,
  PiTrash,
  PiChatCircle,
  PiArrowLeft,
  PiClock,
  PiCheck,
  PiX,
} from "react-icons/pi";

import type { ThreadItem } from "./types";
import {
  DUMMY_THREADS,
  MAX_PINNED,
  getThreadGroup,
  getRelativeTime,
} from "./types";

// =====================================
// ⬢ Inline Rename Input
// =====================================

interface RenameInputProps {
  initialValue: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

function RenameInput({ initialValue, onConfirm, onCancel }: RenameInputProps) {
  const [value, setValue] = useState(initialValue);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    e.stopPropagation();
    if (e.key === "Enter") onConfirm(value.trim() || initialValue);
    if (e.key === "Escape") onCancel();
  }

  return (
    <div
      className="flex items-center gap-1 flex-1 min-w-0"
      onClick={e => e.stopPropagation()}
    >
      <input
        ref={ref}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 min-w-0 text-[12.5px] font-medium
            bg-white dark:bg-[#2A2A28]
            border border-[#A308F0] rounded-md px-2 py-0.5
            outline-none text-ink-500 dark:text-ink-200"
      />
      <button
        type="button"
        onClick={() => onConfirm(value.trim() || initialValue)}
        aria-label="Confirm"
        className="flex-shrink-0 text-[#A308F0] hover:opacity-80 transition-opacity"
      >
        <PiCheck size={13} weight="bold" />
      </button>
      <button
        type="button"
        onClick={onCancel}
        aria-label="Cancel"
        className="flex-shrink-0 text-ink-300 hover:text-ink-500 transition-colors"
      >
        <PiX size={13} weight="bold" />
      </button>
    </div>
  );
}

// =====================================
// ⬢ Row Action Button
// =====================================

interface ActionBtnProps {
  icon: React.ReactNode;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  danger?: boolean;
}

function ActionBtn({ icon, label, onClick, danger }: ActionBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex items-center justify-center w-6 h-6 rounded-md transition-all duration-100
          ${
            danger
              ? "text-ink-300 hover:text-[#D85A30] hover:bg-[#FAECE7] dark:hover:bg-[#1A0D08]"
              : "text-ink-300 hover:text-ink-500 dark:hover:text-ink-200 hover:bg-[#E8E8E6] dark:hover:bg-[#2A2A28]"
          }`}
    >
      {icon}
    </button>
  );
}

// =====================================
// ⬢ Thread Row
// =====================================

interface ThreadRowProps {
  item: ThreadItem;
  isRenamingThis: boolean;
  canPin: boolean;
  onSelect: (id: string) => void;
  onPin: (id: string) => void;
  onRename: (id: string) => void;
  onRenameConfirm: (id: string, value: string) => void;
  onRenameCancel: () => void;
  onDelete: (id: string) => void;
}

function ThreadRow({
  item,
  isRenamingThis,
  canPin,
  onSelect,
  onPin,
  onRename,
  onRenameConfirm,
  onRenameCancel,
  onDelete,
}: ThreadRowProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`group relative flex items-center gap-2.5 px-3 py-2.5
          rounded-xl mx-1.5 transition-colors duration-100 cursor-pointer
          ${hovered ? "bg-[#F9F5FF] dark:bg-[#1A0D26]" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !isRenamingThis && onSelect(item.id)}
    >
      {/* ── Icon ── */}
      <div
        className="flex-shrink-0 flex items-center justify-center w-7 h-7
          rounded-lg border border-[#DEE2E6] dark:border-[#3A3A38]
          bg-white dark:bg-[#252523] text-ink-300 dark:text-ink-500"
      >
        <PiChatCircle size={13} weight="regular" />
      </div>

      {/* ── Content ── */}
      <div className="flex-1 min-w-0">
        {isRenamingThis ? (
          <RenameInput
            initialValue={item.title}
            onConfirm={val => onRenameConfirm(item.id, val)}
            onCancel={onRenameCancel}
          />
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-[12.5px] font-medium text-ink-500 dark:text-ink-200 truncate leading-tight flex-1">
              {item.title}
            </span>
            {item.isPinned && !hovered && (
              <PiPushPin
                size={10}
                weight="fill"
                className="flex-shrink-0 text-[#A308F0] opacity-60"
              />
            )}
            {!isRenamingThis && (
              <span className="text-[10px] text-ink-300 dark:text-ink-600 flex-shrink-0 tabular-nums">
                {getRelativeTime(item.updatedAt)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Hover actions ── */}
      {!isRenamingThis && hovered && (
        <div
          className="flex-shrink-0 flex items-center gap-0.5"
          onClick={e => e.stopPropagation()}
        >
          {/* Pin — greyed out + tooltip when at max and not already pinned */}
          <ActionBtn
            icon={
              item.isPinned ? (
                <PiPushPinSlash size={13} weight="regular" />
              ) : (
                <PiPushPin size={13} weight="regular" />
              )
            }
            label={
              item.isPinned
                ? "Unpin"
                : canPin
                  ? "Pin"
                  : `Max ${MAX_PINNED} pinned`
            }
            onClick={e => {
              e.stopPropagation();
              if (item.isPinned || canPin) onPin(item.id);
            }}
          />
          <ActionBtn
            icon={<PiPencilSimple size={13} weight="regular" />}
            label="Rename"
            onClick={e => {
              e.stopPropagation();
              onRename(item.id);
            }}
          />
          <ActionBtn
            icon={<PiTrash size={13} weight="regular" />}
            label="Delete"
            onClick={e => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            danger
          />
        </div>
      )}
    </div>
  );
}

// =====================================
// ⬢ Section Label
// =====================================

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 pt-3 pb-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-300 dark:text-ink-600">
        {label}
      </span>
      <div className="flex-1 h-px bg-[#F1F3F4] dark:bg-[#2A2A28]" />
    </div>
  );
}

// =====================================
// ⬢ Empty State
// =====================================

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2">
      <PiClock size={20} className="text-ink-200 dark:text-ink-600" />
      <p className="text-[12px] text-ink-300 dark:text-ink-500 text-center">
        {query ? `No threads matching "${query}"` : "No threads yet"}
      </p>
    </div>
  );
}

// =====================================
// ⬢ ThreadList
// =====================================

export interface ThreadListProps {
  onSelectThread: (id: string) => void;
  onBack: () => void;
}

export function ThreadList({ onSelectThread, onBack }: ThreadListProps) {
  const [items, setItems] = useState<ThreadItem[]>(DUMMY_THREADS);
  const [query, setQuery] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // ── Filtering ──
  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(item => item.title.toLowerCase().includes(q));
  }, [items, query]);

  // ── Grouped ──
  const grouped = useMemo(() => {
    const pinned = filtered.filter(i => i.isPinned);
    const unpinned = filtered.filter(i => !i.isPinned);
    const today = unpinned.filter(i => getThreadGroup(i.updatedAt) === "today");
    const yesterday = unpinned.filter(
      i => getThreadGroup(i.updatedAt) === "yesterday"
    );
    const earlier = unpinned.filter(
      i => getThreadGroup(i.updatedAt) === "earlier"
    );
    return { pinned, today, yesterday, earlier };
  }, [filtered]);

  const pinnedCount = items.filter(i => i.isPinned).length;
  const canPin = pinnedCount < MAX_PINNED;

  // ── Actions ──
  const handlePin = useCallback(
    (id: string) => {
      setItems(prev => {
        const item = prev.find(i => i.id === id);
        if (!item) return prev;
        // Enforce max pinned — only allow pin if under limit
        if (!item.isPinned && pinnedCount >= MAX_PINNED) return prev;
        return prev.map(i =>
          i.id === id ? { ...i, isPinned: !i.isPinned } : i
        );
      });
    },
    [pinnedCount]
  );

  const handleRenameConfirm = useCallback((id: string, value: string) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, title: value } : i)));
    setRenamingId(null);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  // ── Section renderer ──
  function renderSection(label: string, sectionItems: ThreadItem[]) {
    if (sectionItems.length === 0) return null;
    return (
      <div key={label}>
        <SectionLabel label={label} />
        {sectionItems.map(item => (
          <ThreadRow
            key={item.id}
            item={item}
            isRenamingThis={renamingId === item.id}
            canPin={canPin}
            onSelect={onSelectThread}
            onPin={handlePin}
            onRename={id => setRenamingId(id)}
            onRenameConfirm={handleRenameConfirm}
            onRenameCancel={() => setRenamingId(null)}
            onDelete={handleDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-base-100">
      {/* ── Header ── */}
      <header
        className="flex items-center gap-2 px-3 pt-3 pb-2.5
          border-b border-border-secondary dark:border-border-secondary"
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to chat"
          className="flex items-center justify-center w-7 h-7 rounded-lg
              text-ink-400 hover:text-ink-500 hover:bg-[#F1F3F4] dark:hover:bg-[#2A2A28]
              transition-colors"
        >
          <PiArrowLeft size={15} weight="regular" />
        </button>
        <h3 className="text-[13px] font-medium text-ink-100 dark:text-white">
          Threads
        </h3>
        {filtered.length > 0 && (
          <span className="ml-auto text-[10.5px] text-ink-300 dark:text-ink-600 tabular-nums">
            {filtered.length}
          </span>
        )}
      </header>

      {/* ── Search ── */}
      <div className="px-3 py-2.5 border-b border-[#F1F3F4] dark:border-[#2A2A28]">
        <div
          className="flex items-center gap-2 px-2.5 py-1.5
            bg-[#F1F3F4] dark:bg-[#2A2A28]
            border border-transparent
            focus-within:border-[#D9A8F8] dark:focus-within:border-[#7A06B8]
            rounded-xl transition-colors duration-150"
        >
          <PiMagnifyingGlass
            size={13}
            className="text-ink-300 dark:text-ink-600 flex-shrink-0"
          />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search threads…"
            className="flex-1 bg-transparent outline-none text-[12.5px]
                text-ink-500 dark:text-ink-200
                placeholder:text-ink-300 dark:placeholder:text-ink-600"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-ink-300 hover:text-ink-500 transition-colors"
            >
              <PiX size={12} weight="bold" />
            </button>
          )}
        </div>
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto py-1.5">
        {filtered.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          <>
            {renderSection("Pinned", grouped.pinned)}
            {renderSection("Today", grouped.today)}
            {renderSection("Yesterday", grouped.yesterday)}
            {renderSection("Earlier", grouped.earlier)}
          </>
        )}
      </div>
    </div>
  );
}
