import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@sandworm/ui/components/dropdown-menu";
import { Button } from "@sandworm/ui/components/button";
import { Badge } from "@sandworm/ui/components/badge";
import { IoFilterOutline } from "react-icons/io5";
import { PiSquareSplitVerticalFill, PiListThin } from "react-icons/pi";

import { cn } from "@/lib/utils";
import { iconButtonMdClassName } from "@/styles/interactive";

import type { FilterOption, SortOption } from "./useProjectFilter";

export type { FilterOption, SortOption };

type ViewType = "grid" | "table";

interface ProjectControlProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onViewChange?: (view: ViewType) => void;
  activeFilter?: FilterOption;
  onFilterChange?: (filter: FilterOption) => void;
  activeSort?: SortOption;
  onSortChange?: (sort: SortOption) => void;
  hideFilter?: boolean;
}

const FILTER_OPTIONS: FilterOption[] = [
  "All",
  "Published",
  "Favorites",
  "Recent",
  "Created by me",
];

const SORT_OPTIONS: SortOption[] = [
  "Last Modified",
  "Name (A-Z)",
  "Name (Z-A)",
  "Date Created (Newest)",
  "Date Created (Oldest)",
];

const ProjectControl: React.FC<ProjectControlProps> = ({
  searchValue,
  onSearchChange,
  onViewChange,
  activeFilter = "All",
  onFilterChange,
  activeSort = "Last Modified",
  onSortChange,
  hideFilter = false,
}) => {
  const [activeView, setActiveView] = useState<ViewType>("grid");

  const handleViewChange = (view: ViewType): void => {
    setActiveView(view);
    onViewChange?.(view);
  };

  const handleFilterSelect = (filter: FilterOption): void => {
    onFilterChange?.(filter === activeFilter ? "All" : filter);
  };

  return (
    <div className="mb-2">
      <div className="mx-auto py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* ✦ Search Input ✦ */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchValue ?? ""}
                onChange={e => onSearchChange?.(e.target.value)}
                className="w-52 pl-10 pr-4 py-1 h-8 rounded-lg border border-transparent dark:border-border-tertiary dark:bg-base-400 dark:text-white placeholder:dark:text-placeholder-muted focus:outline-none focus:ring focus:ring-primary transition text-xs md:text-sm bg-base-600 placeholder:text-ink-300"
              />
            </div>

            {/* ✦ Filter Dropdown ✦ */}
            {!hideFilter && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 outline-none border border-transparent text-sm bg-transparent text-ink-200 hover:bg-hover-bg hover:border-hover-border dark:hover:bg-base-600 h-7"
                    >
                      <IoFilterOutline className="w-4 h-4" />
                      <span>Filter</span>
                      {activeFilter !== "All" && (
                        <Badge variant="secondary" className="ml-1 px-1 py-0.5">
                          1
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {FILTER_OPTIONS.map(filter => (
                      <DropdownMenuItem
                        key={filter}
                        onClick={() => handleFilterSelect(filter)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <span>{filter}</span>
                        {activeFilter === filter && filter !== "All" && (
                          <div className="w-4 h-4 bg-primary rounded flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {activeFilter !== "All" && (
                  <Badge
                    variant="secondary"
                    className="gap-1 px-2 py-0.5 bg-[rgba(177,182,196,0.1)] text-ink-400 font-medium"
                  >
                    <span>{activeFilter}</span>
                    <button
                      type="button"
                      onClick={() => onFilterChange?.("All")}
                      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* ✦ Sort Dropdown ✦ */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex-shrink-0 flex items-center justify-center rounded-md transition-all duration-100",
                    "h-7 px-2 text-sm gap-1.5 border border-transparent text-ink-200",
                    "hover:bg-hover-bg hover:border-hover-border dark:hover:bg-base-600"
                  )}
                >
                  <span>Sort by</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {SORT_OPTIONS.map(option => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => onSortChange?.(option)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span>{option}</span>
                    {activeSort === option && (
                      <div className="w-4 h-4 bg-primary rounded flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-6 bg-border-tertiary mx-1" />

            {/* ✦ View Switcher ✦ */}
            <button
              type="button"
              className={cn(
                iconButtonMdClassName,
                "border border-transparent rounded-[10px] hover:bg-hover-bg hover:border-hover-border dark:hover:bg-base-600",
                activeView === "grid" &&
                  "text-primary hover:text-primary dark:text-white dark:hover:text-white dark:bg-base-400 dark:border-border-tertiary"
              )}
              onClick={() => handleViewChange("grid")}
              title="Grid view"
            >
              <PiSquareSplitVerticalFill className="text-xl" />
            </button>

            <button
              type="button"
              className={cn(
                iconButtonMdClassName,
                "border border-transparent rounded-[10px] hover:bg-hover-bg hover:border-hover-border dark:hover:bg-base-600",
                activeView === "table" &&
                  "text-primary hover:text-primary dark:text-white dark:hover:text-white dark:bg-base-400 dark:border-border-tertiary"
              )}
              onClick={() => handleViewChange("table")}
              title="Table view"
            >
              <PiListThin className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectControl;
