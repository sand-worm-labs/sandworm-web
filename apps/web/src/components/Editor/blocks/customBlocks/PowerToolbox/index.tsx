"use client";

import { Fragment, useState, useEffect, useRef, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useApolloClient } from "@apollo/client";
import clsx from "clsx";
import {
  getAllCategories,
  getToolsByCategory,
  getToolCountByCategory,
  getToolCount,
  searchTools,
  loadToolsFromApi,
  isToolsLoaded,
  loadCategoriesFromApi,
  isCategoriesLoaded,
} from "@sandworm/editor";
import type { ToolCategory, ToolDefinition } from "@sandworm/editor";

import { BoltIcon as PowerToolBoxIcon } from "@/components/Assets/BoltIcon";
import { fetchCategoriesForRegistry } from "@/graphql/loaders/tool-categories";
import { fetchToolsForRegistry } from "@/graphql/loaders/tools";

import { usePowerToolboxKeyboard } from "../../../hooks/usePowertoolboxKeyboard";

interface PowerToolboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: string) => void;
}

type ModalStep = "categories" | "tools";

function CategoryIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="w-4 h-4 shrink-0"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="6"
        height="6"
        rx="1.5"
        className="fill-icon-muted stroke-ink-navy"
        strokeWidth="1.2"
      />
      <rect
        x="11"
        y="3"
        width="6"
        height="6"
        rx="1.5"
        className="fill-icon-muted/50 stroke-ink-navy/60"
        strokeWidth="1.2"
      />
      <rect
        x="3"
        y="11"
        width="6"
        height="6"
        rx="1.5"
        className="fill-icon-muted/50 stroke-ink-navy/60"
        strokeWidth="1.2"
      />
      <rect
        x="11"
        y="11"
        width="6"
        height="6"
        rx="1.5"
        className="fill-icon-muted/50 stroke-ink-navy/60"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={clsx("w-4 h-4 shrink-0", className)}
      aria-hidden="true"
    >
      <path
        d="M11 2L4 11h6l-1 7 7-9h-6l1-7z"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-current"
      />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={clsx("w-4 h-4 shrink-0", className)}
      aria-hidden="true"
    >
      <path
        d="M6 12l4-4-4-4"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-current"
      />
    </svg>
  );
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={clsx("w-4 h-4 shrink-0", className)}
      aria-hidden="true"
    >
      <path
        d="M10 12L6 8l4-4"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-current"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="w-4 h-4 shrink-0 text-ink-400"
      aria-hidden="true"
    >
      <circle
        cx="8.5"
        cy="8.5"
        r="5"
        strokeWidth="1.5"
        className="stroke-current"
      />
      <path
        d="M15 15l-2.5-2.5"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="stroke-current"
      />
    </svg>
  );
}

interface CategoryRowProps {
  category: ToolCategory;
  toolCount: number;
  isActive: boolean;
  index: number;
  onHover: (index: number) => void;
  onSelect: () => void;
}

function CategoryRow({
  category,
  toolCount,
  isActive,
  index,
  onHover,
  onSelect,
}: CategoryRowProps) {
  return (
    <button
      type="button"
      data-ptb-index={index}
      onClick={onSelect}
      onMouseEnter={() => onHover(index)}
      className={clsx(
        "w-full flex items-center gap-3 px-4 py-3 text-left",
        "transition-colors duration-75 rounded-lg",
        isActive ? "bg-base-600" : "hover:bg-base-600"
      )}
    >
      <span
        className={clsx(
          "flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ",
          isActive ? "bg-[#DFEDED]" : "hover:bg-[#DFEDED] bg-base-600"
        )}
      >
        <BoltIcon
          className={clsx(
            "transition-colors",
            isActive ? "text-link" : "text-ink-navy"
          )}
        />
      </span>

      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-ink-100 leading-tight">
          {category.name}
        </span>
        <span className="block text-xs text-ink-400 mt-0.5 leading-tight">
          {toolCount} {toolCount === 1 ? "block" : "blocks"}
        </span>
      </span>

      <ChevronRight
        className={clsx(
          "transition-colors",
          isActive ? "text-ink-100" : "text-ink-400"
        )}
      />
    </button>
  );
}

interface ToolRowProps {
  tool: ToolDefinition;
  isActive: boolean;
  index: number;
  onHover: (index: number) => void;
  onSelect: () => void;
  showCategory?: boolean;
}

function ToolRow({
  tool,
  isActive,
  index,
  onHover,
  onSelect,
  showCategory = false,
}: ToolRowProps) {
  return (
    <button
      type="button"
      data-ptb-index={index}
      onClick={onSelect}
      onMouseEnter={() => onHover(index)}
      className={clsx(
        "w-full flex items-center gap-3 px-4 py-3 text-left",
        "transition-colors duration-75 rounded-lg",
        isActive ? "hover:bg-base-600" : "hover:bg-base-600"
      )}
    >
      <span
        className={clsx(
          "flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
          isActive
            ? "bg-[#DFEDED] border-none"
            : "bg-white/[0.04] border border-white/10"
        )}
      >
        <BoltIcon
          className={clsx(
            "transition-colors",
            isActive ? "text-link" : "text-ink-400"
          )}
        />
      </span>

      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-ink-100 leading-tight truncate">
          {tool.name}
        </span>
        <span className="block text-xs text-ink-400 mt-0.5 leading-tight truncate">
          {showCategory
            ? `${tool.categoryId} · ${tool.description}`
            : tool.description}
        </span>
      </span>

      {isActive && (
        <span className="text-[10px] font-medium text-ink-400  border border-white/10 rounded px-1.5 py-0.5 shrink-0">
          Enter
        </span>
      )}
    </button>
  );
}

function KeyHint({
  keys,
  label,
  muted = false,
}: {
  keys: string[];
  label: string;
  muted?: boolean;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 text-[12px] font-body",
        muted ? "text-ink-400" : "text-ink-400"
      )}
    >
      {keys.map(k => (
        <kbd
          key={k}
          className={clsx(
            "inline-flex items-center justify-center font-body lowercase",
            "min-w-[20px] h-5 px-1 rounded",
            " text-[14px] leading-none",
            muted
              ? "bg-white/[0.04] border border-border-secondary text-ink-navy"
              : "bg-white/[0.06] border border-border-secondary text-ink-navy"
          )}
        >
          {k}
        </kbd>
      ))}
      <span className="ml-0.5 font-body lowercase"> to {label}</span>
    </span>
  );
}

export function PowerToolboxModal({
  isOpen,
  onClose,
  onSelectTool,
}: PowerToolboxModalProps) {
  const [step, setStep] = useState<ModalStep>("categories");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ToolCategory | null>(
    null
  );
  const [activeIndex, setActiveIndex] = useState(-1);
  const [toolsReady, setToolsReady] = useState(isToolsLoaded());
  const [categoriesReady, setCategoriesReady] = useState(isCategoriesLoaded());

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const client = useApolloClient();

  // The registry is populated asynchronously (see PowerToolsBootstrap) —
  // loadToolsFromApi/loadCategoriesFromApi are idempotent, so calling them
  // again here just awaits the same in-flight/completed load if the
  // bootstrap already kicked it off, and forces this component to re-render
  // once they resolve so the getAllTools()/getAllCategories()/etc. reads
  // below pick up the now-populated catalog.
  useEffect(() => {
    if (toolsReady) return;
    loadToolsFromApi(() => fetchToolsForRegistry(client)).then(() =>
      setToolsReady(true)
    );
  }, [client, toolsReady]);

  useEffect(() => {
    if (categoriesReady) return;
    loadCategoriesFromApi(() => fetchCategoriesForRegistry(client)).then(() =>
      setCategoriesReady(true)
    );
  }, [client, categoriesReady]);

  const categories = getAllCategories();
  const toolCountByCategory = getToolCountByCategory();
  const totalCount = getToolCount();

  const isSearching = query.trim().length > 0;

  const searchResults = isSearching ? searchTools(query) : [];

  const categoryTools =
    step === "tools" && activeCategory
      ? getToolsByCategory(activeCategory.id)
      : [];

  const visibleItems: Array<ToolCategory | ToolDefinition> = isSearching
    ? searchResults
    : step === "categories"
      ? categories
      : categoryTools;

  useEffect(() => {
    if (isOpen) {
      setStep("categories");
      setQuery("");
      setActiveCategory(null);
      setActiveIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [step, query]);

  const handleSelect = useCallback(
    (index: number) => {
      const item = visibleItems[index];
      if (!item) return;

      if (isSearching || step === "tools") {
        onSelectTool((item as ToolDefinition).id);
        console.log("onSelectTool fired", item.id);
        onClose();
      } else {
        setActiveCategory(item as ToolCategory);
        setStep("tools");
      }
    },
    [visibleItems, isSearching, step, onSelectTool, onClose]
  );

  const handleBack = useCallback(() => {
    if (step === "tools") {
      setStep("categories");
      setActiveCategory(null);
      setActiveIndex(-1);
    }
  }, [step]);

  const { setActive } = usePowerToolboxKeyboard({
    itemCount: visibleItems.length,
    onSelect: handleSelect,
    onBack: step === "tools" ? handleBack : undefined,
    onClose,
    enabled: isOpen,
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const index = (e as CustomEvent<number>).detail;
      setActiveIndex(index);
    };
    document.addEventListener("ptb:active", handler);
    return () => document.removeEventListener("ptb:active", handler);
  }, []);

  const handleHover = useCallback(
    (index: number) => {
      setActiveIndex(index);
      setActive(index);
    },
    [setActive]
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[99]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/[10.2%]" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-start justify-center pt-[15vh] px-4 font-body">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-150"
            enterFrom="opacity-0 scale-[0.97] translate-y-1"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-100"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-[0.97] translate-y-1"
          >
            <Dialog.Panel
              className={clsx(
                "w-full max-w-[655px] rounded-2xl overflow-hidden",
                "bg-base-100 border border-border-secondary"
              )}
            >
              <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-border-secondary">
                {step === "tools" && !isSearching && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className={clsx(
                      "flex items-center justify-center w-7 h-7 rounded-lg shrink-0",
                      "text-ink-400 hover:text-white/70 hover:bg-white/[0.06]",
                      "transition-colors"
                    )}
                    aria-label="Back to categories"
                  >
                    <ChevronLeft />
                  </button>
                )}

                {(step === "categories" || isSearching) && <PowerToolBoxIcon />}

                <Dialog.Title className="text-base font-medium text-ink-100 leading-none">
                  {isSearching
                    ? `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""}`
                    : step === "categories"
                      ? "Power Toolbox"
                      : (activeCategory?.name ?? "")}
                </Dialog.Title>

                {step === "tools" && !isSearching && activeCategory && (
                  <span className="ml-auto text-[10px] font-medium text-ink-100 border border-white/10 rounded-full px-2 py-0.5">
                    {toolCountByCategory[activeCategory.id]} blocks
                  </span>
                )}
              </div>

              <div className="px-3 pt-3 pb-2">
                <div
                  className={clsx(
                    "flex items-center gap-2.5 px-3 py-1.5 rounded-lg",
                    "bg-white/[0.04] border border-border-secondary",
                    "focus-within:border-primary/40 ",
                    "transition-colors"
                  )}
                >
                  <SearchIcon />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={
                      step === "categories"
                        ? `Search ${totalCount} blocks...`
                        : `Search ${activeCategory?.name ?? ""} blocks...`
                    }
                    className={clsx(
                      "flex-1 bg-transparent text-sm text-ink-100 placeholder:text-ink-400",
                      "outline-none caret-primary"
                    )}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="text-ink-400 hover:text-white/50 transition-colors text-xs"
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div
                ref={listRef}
                className="px-2 pb-2 max-h-[460px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
              >
                {isSearching && (
                  <div>
                    {searchResults.length === 0 ? (
                      <div className="py-10 text-center">
                        <p className="text-sm text-ink-400">
                          No blocks found for
                        </p>
                        <p className="text-sm text-ink-400 mt-0.5 font-medium">
                          &ldquo;{query}&rdquo;
                        </p>
                      </div>
                    ) : (
                      <div className="py-1">
                        {getAllCategories()
                          .filter(cat =>
                            searchResults.some(t => t.categoryId === cat.id)
                          )
                          .map(cat => {
                            const catTools = searchResults.filter(
                              t => t.categoryId === cat.id
                            );
                            return (
                              <div key={cat.id} className="mb-1">
                                <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-ink-100">
                                  {cat.name}
                                </p>
                                {catTools.map(tool => {
                                  const flatIndex = searchResults.indexOf(tool);
                                  return (
                                    <ToolRow
                                      key={tool.id}
                                      tool={tool}
                                      isActive={activeIndex === flatIndex}
                                      index={flatIndex}
                                      onHover={handleHover}
                                      onSelect={() => {
                                        onSelectTool(tool.id);
                                        onClose();
                                      }}
                                    />
                                  );
                                })}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}

                {!isSearching && step === "categories" && (
                  <>
                    <div className="px-4 pt-3 pb-2">
                      <span
                        className={clsx(
                          "inline-flex items-center gap-1.5 text-xs font-medium",
                          "px-2.5 py-0.5 rounded-md",
                          "bg-base-600 border border-border-secondary text-ink-100"
                        )}
                      >
                        <CategoryIcon />
                        All Blocks
                      </span>
                    </div>

                    <div className="py-1">
                      {categories.map((cat, i) => (
                        <CategoryRow
                          key={cat.id}
                          category={cat}
                          toolCount={toolCountByCategory[cat.id] ?? 0}
                          isActive={activeIndex === i}
                          index={i}
                          onHover={handleHover}
                          onSelect={() => {
                            setActiveCategory(cat);
                            setStep("tools");
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}

                {!isSearching && step === "tools" && activeCategory && (
                  <div className="py-1">
                    {categoryTools.map((tool, i) => (
                      <ToolRow
                        key={tool.id}
                        tool={tool}
                        isActive={activeIndex === i}
                        index={i}
                        onHover={handleHover}
                        onSelect={() => {
                          onSelectTool(tool.id);
                          onClose();
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div
                className={clsx(
                  "flex items-center gap-4 px-4 py-2.5",
                  "border-t border-white/[0.05]"
                )}
              >
                <KeyHint keys={["↑", "↓"]} label="navigate" />
                <KeyHint keys={["↵"]} label="select" />
                {step === "tools" && !isSearching && (
                  <KeyHint keys={["Esc"]} label="back" />
                )}
                <span className="ml-auto">
                  <KeyHint keys={["Esc"]} label="close" muted />
                </span>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
