import React, { useState } from "react";
import { X, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@sandworm/ui/components/dropdown-menu";
import { Button } from "@sandworm/ui/components/button";
import { Badge } from "@sandworm/ui/components/badge";
import { IoFilterOutline } from "react-icons/io5";

import { cn } from "@/lib/utils";
import { SearchField } from "@/components/inputs/SearchField";
import {
  GRID_VIEW,
  LIST_VIEW,
  ViewToggle,
  type ViewOption,
} from "@/components/inputs/ViewToggle";

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

const VIEW_OPTIONS: ViewOption<ViewType>[] = [
  GRID_VIEW,
  { ...LIST_VIEW, value: "table", label: "Table view" },
];

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
            <SearchField
              placeholder="Search projects..."
              value={searchValue ?? ""}
              onChange={value => onSearchChange?.(value)}
            />

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

            <ViewToggle
              value={activeView}
              onChange={handleViewChange}
              options={VIEW_OPTIONS}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectControl;
