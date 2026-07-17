"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ChevronUp,
  ChevronDown,
  CornerDownLeft,
  User2Icon,
  LucideBox,
  File,
} from "lucide-react";
import { Input } from "@sandworm/ui/components/input";

// 🎨 Types
// =====================================
type Filter =
  | "all"
  | "creators"
  | "dashboard"
  | "reports"
  | "notebooks"
  | "date";

// =====================================
// Search Bar Component
// =====================================
export const SearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") ?? "";
  const [query, setQuery] = useState(currentSearch);
  const [isActive, setIsActive] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 🔁 Effects / Subscriptions
  useEffect(() => {
    setQuery(currentSearch);
  }, [currentSearch]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  // ⬢ Mock Suggestions Data
  // =====================================
  const suggestionsByCategory = {
    dashboards: [
      { id: "1", title: "DeFi Analytics Dashboard" },
      { id: "2", title: "NFT Market Overview" },
    ],
    creators: [
      { id: "3", title: "vitalik.eth" },
      { id: "4", title: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" },
    ],
    reports: [
      { id: "5", title: "Q4 Gas Fee Analysis" },
      { id: "6", title: "Smart Contract Audit Report" },
    ],
  };

  const allSuggestions = [
    ...suggestionsByCategory.dashboards,
    ...suggestionsByCategory.creators,
    ...suggestionsByCategory.reports,
  ];

  // ⬢ Filters Definition
  // =====================================
  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "creators", label: "Creators" },
    { key: "dashboard", label: "Dashboard" },
    { key: "reports", label: "Reports" },
    { key: "notebooks", label: "Notebooks" },
    { key: "date", label: "Date Filter" },
  ];

  // ⬢ Keyboard Navigation Handlers
  // =====================================
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex(prev => (prev + 1) % allSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex(prev =>
        prev <= 0 ? allSuggestions.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const finalQuery =
        highlightIndex >= 0 && allSuggestions[highlightIndex]
          ? allSuggestions[highlightIndex].title
          : query.trim();

      setQuery(finalQuery);
      setIsActive(false);
      setHighlightIndex(-1);

      const tab = searchParams.get("tab") || "all";
      const page = "1";

      if (finalQuery) {
        router.push(
          `workspace/explore?tab=${tab}&page=${page}&search=${encodeURIComponent(finalQuery)}`
        );
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsActive(false);
      setHighlightIndex(-1);
    }
  };

  // ⬢ Click Outside Handler
  // =====================================
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsActive(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //  // ⬢ Render Component
  // =====================================
  return (
    <div className="relative" ref={searchContainerRef}>
      {/* Search Icon Button Trigger */}
      <button
        type="button"
        onClick={() => setIsActive(true)}
        className="p-2 rounded-lg dark:bg-base-100 border dark:border-border-tertiary border-border dark:text-white text-ink-200 hover:bg-gray-100 dark:hover:bg-editor-500 transition-colors bg-base-300"
        aria-label="Open search"
      >
        <Search size={18} />
      </button>

      {isActive && (
        <div className="absolute z-50 top-full mt-4 left-[0px] min-w-[32rem] dark:bg-base-100 bg-white border dark:border-border-tertiary rounded-xl shadow-md overflow-hidden border-border-quiet">
          {/* Search Input Inside Dropdown */}
          <div className="px-4 py-3 border-b dark:border-border-tertiary border-border-secondary">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-text-gray"
              />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search Queries, Dashboards, Users"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setHighlightIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-16 py-1 rounded-md dark:bg-ink-100 border dark:border-border-tertiary border-border dark:text-white placeholder:dark:text-ink-300  placeholder-[#455768] focus:outline-none focus:ring-[1p] focus:ring-primary transition text-xs md:text-sm bg-base-300 font-body "
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-gray select-none font-medium">
                Press{" "}
                <kbd className="dark:bg-white dark:text-ink-200 text-ink-200 bg-[#E0EAF1] px-1 py-0.5 rounded ml-1">
                  Enter
                </kbd>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="px-4 py-3 border-b dark:border-border-tertiary border-border-secondary">
            <div className="flex flex-wrap gap-2">
              {filters.map(filter => (
                <button
                  type="button"
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-3 py-0.5 rounded-md text-[0.75rem] font-medium transition-colors ${
                    activeFilter === filter.key
                      ? "bg-primary  text-white"
                      : "dark:bg-editor-500 dark:text-gray-300 dark:hover:bg-[#30363d]  text-ink-100  hover:bg-gray-200 border border-border-quiet dark:border-border-tertiary"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Suggestions Section */}
          <div className="py-2">
            <div className="px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-wide text-ink-400">
              Suggestions
            </div>

            {/* Dashboards */}
            <div>
              <div className="px-4 py-2 text-[0.8rem]  font-medium text-primary">
                Dashboards
              </div>
              {suggestionsByCategory.dashboards.map(item => {
                const globalIndex = allSuggestions.findIndex(
                  s => s.id === item.id
                );
                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`w-full px-4 py-2 flex items-center gap-3 transition-colors ${
                      highlightIndex === globalIndex
                        ? "dark:bg-editor-300 bg-gray-100"
                        : "dark:hover:bg-editor-300 hover:bg-gray-50"
                    }`}
                    onMouseEnter={() => setHighlightIndex(globalIndex)}
                    onClick={() => {
                      setQuery(item.title);
                      setIsActive(false);
                      setHighlightIndex(-1);

                      const tab = searchParams.get("tab") || "all";
                      const page = "1";

                      router.push(
                        `workspace/explore?tab=${tab}&page=${page}&search=${encodeURIComponent(item.title)}`
                      );
                    }}
                  >
                    <span className="border border-border-quiet p-1 rounded-md dark:border-border-tertiary">
                      <LucideBox size={18} className="text-link" />
                    </span>
                    <div className="flex-1 text-left">
                      <div className="font-medium dark:text-gray-200 text-ink-200 text-sm ">
                        {item.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <hr className="my-2 dark:border-border-secondary border-border-secondary" />

            {/* Creators */}
            <div>
              <div className="px-4 py-2 text-[0.8rem] font-medium text-primary">
                Creators
              </div>
              {suggestionsByCategory.creators.map(item => {
                const globalIndex = allSuggestions.findIndex(
                  s => s.id === item.id
                );
                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`w-full px-4 py-2 flex items-center gap-3 transition-colors ${
                      highlightIndex === globalIndex
                        ? "dark:bg-editor-300 bg-gray-100"
                        : "dark:hover:bg-editor-300 hover:bg-gray-50"
                    }`}
                    onMouseEnter={() => setHighlightIndex(globalIndex)}
                    onClick={() => {
                      setQuery(item.title);
                      setIsActive(false);
                      setHighlightIndex(-1);

                      const tab = searchParams.get("tab") || "all";
                      const page = "1";

                      router.push(
                        `workspace/explore?tab=${tab}&page=${page}&search=${encodeURIComponent(item.title)}`
                      );
                    }}
                  >
                    <span className="border border-border-quiet p-1 rounded-md dark:border-border-tertiary">
                      <User2Icon size={18} className="text-link" />
                    </span>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm dark:text-gray-200 text-ink-200">
                        @{item.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <hr className="my-2 dark:border-border-tertiary border-border-secondary " />

            {/* Reports */}
            <div>
              <div className="px-4 py-2 text-[0.8rem]  font-medium text-primary">
                Reports
              </div>
              {suggestionsByCategory.reports.map(item => {
                const globalIndex = allSuggestions.findIndex(
                  s => s.id === item.id
                );
                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`w-full px-4 py-2 flex items-center gap-3 transition-colors ${
                      highlightIndex === globalIndex
                        ? "dark:bg-editor-300 bg-gray-100"
                        : "dark:hover:bg-editor-300 hover:bg-gray-50"
                    }`}
                    onMouseEnter={() => setHighlightIndex(globalIndex)}
                    onClick={() => {
                      setQuery(item.title);
                      setIsActive(false);
                      setHighlightIndex(-1);

                      const tab = searchParams.get("tab") || "all";
                      const page = "1";

                      router.push(
                        `workspace/explore?tab=${tab}&page=${page}&search=${encodeURIComponent(item.title)}`
                      );
                    }}
                  >
                    <span className="border border-border-quiet p-1 rounded-md dark:border-border-tertiary">
                      <File size={18} className="text-link" />
                    </span>
                    <div className="flex-1 text-left">
                      <div className="font-medium dark:text-gray-200 text-ink-200 text-sm">
                        {item.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer with Keyboard Shortcuts */}
          <div className="px-4 py-3 border-t dark:border-border-tertiary border-border-secondary dark:bg-[#0d1117]  flex items-center justify-between text-xs text-ink-400 ">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center space-x-2">
                  <span className="border border-border-quiet dark:border-border-tertiary  p-0.5 rounded-sm">
                    <ChevronUp className="w-3.5 h-3.5" />
                  </span>
                  <span className="border border-border-quiet dark:border-border-tertiary p-0.5 rounded-sm">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </span>
                </div>
                <span>to navigate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="border border-border-quiet p-0.5 dark:border-border-tertiary rounded-sm">
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </span>
                <span>to select</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-0.5 rounded text-[0.8rem] font-medium dark:bg-editor-500 dark:text-gray-300 dark:border-border-tertiary bg-white text-ink-100  border border-gray-300">
                esc
              </kbd>
              <span>to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
