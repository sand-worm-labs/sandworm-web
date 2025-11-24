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

type Filter =
  | "all"
  | "creators"
  | "dashboard"
  | "reports"
  | "notebooks"
  | "date";

export const SearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") ?? "";
  const [query, setQuery] = useState(currentSearch);
  const [isActive, setIsActive] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(currentSearch);
  }, [currentSearch]);

  const suggestionsByCategory = {
    dashboards: [
      { id: "1", title: "Analytics Dashboard", icon: "📈" },
      { id: "2", title: "Sales Dashboard", icon: "📊" },
    ],
    creators: [
      { id: "3", title: "Sarah Chen", icon: "👤" },
      { id: "4", title: "John Smith", icon: "👤" },
    ],
    reports: [
      { id: "5", title: "Q4 Sales Report", icon: "📄" },
      { id: "6", title: "Marketing Analytics", icon: "📊" },
    ],
  };

  const allSuggestions = [
    ...suggestionsByCategory.dashboards,
    ...suggestionsByCategory.creators,
    ...suggestionsByCategory.reports,
  ];

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "creators", label: "Creators" },
    { key: "dashboard", label: "Dashboard" },
    { key: "reports", label: "Reports" },
    { key: "notebooks", label: "Notebooks" },
    { key: "date", label: "Date Filter" },
  ];

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
        highlightIndex >= 0
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

  return (
    <div
      className="relative w-full max-w-md min-w-[26rem] mx-auto"
      ref={searchContainerRef}
    >
      <Search
        size={16}
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-text-gray"
      />
      <div className="relative">
        <Input
          type="text"
          placeholder="Search Queries, Dashboards, Users"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setHighlightIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsActive(true)}
          className="w-full pl-10 pr-16 py-1 rounded-md dark:bg-[#1A1A1A] border dark:border-[#262A30] border-[#DEE2E6] dark:text-white placeholder:dark:text-[#868E96] placeholder-[#455768] focus:outline-none focus:ring focus:ring-gray-300 transition text-xs md:text-sm bg-[#F1F3F4] "
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-gray select-none font-medium">
          Press{" "}
          <kbd className="dark:bg-white dark:text-[#455768] bg-[#E0EAF1] px-1 py-0.5 rounded ml-1">
            Enter
          </kbd>
        </div>
      </div>

      {isActive && (
        <div className="absolute z-50 top-full mt-5 w-[150%] translate-x-[-20%] dark:bg-[#0D1117] bg-white border dark:border-[#30363d] rounded-xl shadow-md overflow-hidden border-[#E3E5E8]">
          {/* Filters Section */}
          <div className="px-4 py-3 border-b dark:border-[#30363d] border-gray-200">
            <div className="flex flex-wrap gap-2">
              {filters.map(filter => (
                <button
                  type="button"
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-3 py-0.5 rounded-md text-[0.75rem] font-medium transition-colors ${
                    activeFilter === filter.key
                      ? "bg-[#C7665C] text-white"
                      : "dark:bg-[#21262d] dark:text-gray-300 dark:hover:bg-[#30363d]  text-[#1A1A1A] hover:bg-gray-200 border border-[#E3E5E8]"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Suggestions Section */}
          <div className="py-2">
            <div className="px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-wide text-[#6C757D]">
              Suggestions
            </div>

            {/* Dashboards */}
            <div>
              <div className="px-4 py-2 text-xs font-medium text-[#C7665C]">
                Dashboards
              </div>
              {suggestionsByCategory.dashboards.map((item, index) => {
                const globalIndex = allSuggestions.findIndex(
                  s => s.id === item.id
                );
                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                      highlightIndex === globalIndex
                        ? "dark:bg-[#161b22] bg-gray-100"
                        : "dark:hover:bg-[#161b22] hover:bg-gray-50"
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
                    <span className="border border-[#E3E5E8] p-1 rounded-md">
                      <LucideBox size={18} className="text-[#005DE7]" />
                    </span>
                    <div className="flex-1 text-left">
                      <div className="font-medium dark:text-gray-200 text-gray-800 text-sm ">
                        {item.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <hr className="my-2 dark:border-[#30363d] border-gray-200" />

            {/* Creators */}
            <div>
              <div className="px-4 py-2 text-xs font-medium text-[#C7665C]">
                Creators
              </div>
              {suggestionsByCategory.creators.map((item, index) => {
                const globalIndex = allSuggestions.findIndex(
                  s => s.id === item.id
                );
                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                      highlightIndex === globalIndex
                        ? "dark:bg-[#161b22] bg-gray-100"
                        : "dark:hover:bg-[#161b22] hover:bg-gray-50"
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
                    <span className="border border-[#E3E5E8] p-1 rounded-md">
                      <User2Icon size={18} className="text-[#005DE7]" />
                    </span>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm dark:text-gray-200 text-[#455768]">
                        @{item.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <hr className="my-2 dark:border-[#30363d] border-gray-200" />

            {/* Reports */}
            <div>
              <div className="px-4 py-2 text-xs font-medium text-[#C7665C]">
                Reports
              </div>
              {suggestionsByCategory.reports.map((item, index) => {
                const globalIndex = allSuggestions.findIndex(
                  s => s.id === item.id
                );
                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                      highlightIndex === globalIndex
                        ? "dark:bg-[#161b22] bg-gray-100"
                        : "dark:hover:bg-[#161b22] hover:bg-gray-50"
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
                    <span className="border border-[#E3E5E8] p-1 rounded-md">
                      <File size={18} className="text-[#005DE7]" />
                    </span>
                    <div className="flex-1 text-left">
                      <div className="font-medium dark:text-gray-200 text-gray-800 text-sm">
                        {item.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer with Keyboard Shortcuts */}
          <div className="px-4 py-3 border-t dark:border-[#30363d] border-gray-200 dark:bg-[#0d1117] bg-gray-50 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center space-x-2">
                  <span className="border border-[#E3E5E8] p-0.5 rounded-sm">
                    <ChevronUp className="w-3.5 h-3.5" />
                  </span>
                  <span className="border border-[#E3E5E8] p-0.5 rounded-sm">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </span>
                </div>
                <span>to navigate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="border border-[#E3E5E8] p-0.5 rounded-sm">
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </span>
                <span>to select</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-0.5 rounded text-xs font-semibold dark:bg-[#21262d] dark:text-gray-300 dark:border-[#30363d] bg-white text-gray-700 border border-gray-300">
                ESC
              </kbd>
              <span>to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
