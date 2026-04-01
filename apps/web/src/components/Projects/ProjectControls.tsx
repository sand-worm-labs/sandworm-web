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
import { PiSquareSplitVerticalFill, PiListThin } from "react-icons/pi";

import { cn } from "@/lib/utils";

type ViewType = "grid" | "table";

type SortOption =
  | "Last Modified"
  | "Name (A-Z)"
  | "Name (Z-A)"
  | "Date Created (Newest)"
  | "Date Created (Oldest)";

type FilterOption =
  | "All Projects"
  | "Favorites"
  | "Recent"
  | "Archived"
  | "Shared with me"
  | "Created by me";

interface ProjectControlProps {
  onViewChange?: (view: ViewType) => void;
  onFilterChange?: (filters: FilterOption[]) => void;
  onSortChange?: (sort: SortOption) => void;
}

const ProjectControl: React.FC<ProjectControlProps> = ({
  onViewChange,
  onFilterChange,
  onSortChange,
}) => {
  const [activeView, setActiveView] = useState<ViewType>("grid");
  const [selectedFilters, setSelectedFilters] = useState<FilterOption[]>([]);
  const [, setSelectedSort] = useState<SortOption>("Last Modified");

  const filterOptions: FilterOption[] = [
    "All Projects",
    "Favorites",
    "Recent",
    "Archived",
    "Shared with me",
    "Created by me",
  ];

  const sortOptions: SortOption[] = [
    "Last Modified",
    "Name (A-Z)",
    "Name (Z-A)",
    "Date Created (Newest)",
    "Date Created (Oldest)",
  ];

  const toggleFilter = (filter: FilterOption): void => {
    const newFilters = selectedFilters.includes(filter)
      ? selectedFilters.filter(f => f !== filter)
      : [...selectedFilters, filter];

    setSelectedFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const removeFilter = (filter: FilterOption): void => {
    const newFilters = selectedFilters.filter(f => f !== filter);
    setSelectedFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleViewChange = (view: ViewType): void => {
    setActiveView(view);
    onViewChange?.(view);
  };

  const handleSortChange = (sort: SortOption): void => {
    setSelectedSort(sort);
    onSortChange?.(sort);
  };

  return (
    <div className=" mb-2">
      <div className="mx-auto py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 outline-none border-none text-sm bg-transparent text-ink-200 hover:bg-[rgba(177,182,196,0.1)] h-7"
                >
                  <IoFilterOutline className="w-4 h-4" />
                  <span>Filter</span>
                  {selectedFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1 py-0.5">
                      {selectedFilters.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {filterOptions.map(filter => (
                  <DropdownMenuItem
                    key={filter}
                    onClick={() => toggleFilter(filter)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span>{filter}</span>
                    {selectedFilters.includes(filter) && (
                      <div className="w-4 h-4 bg-primary  rounded flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {selectedFilters.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {selectedFilters.map(filter => (
                  <Badge
                    key={filter}
                    variant="secondary"
                    className="gap-1 px-2 py-0.5 bg-[rgba(177,182,196,0.1)] text-ink-400 font-edium "
                  >
                    <span>{filter}</span>
                    <button
                      type="button"
                      onClick={() => removeFilter(filter)}
                      className="hover:bg-primary/20 rounded-full p-0.5  transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-2 text-ink-200  hover:bg-primary/20"
                >
                  <span>Sort by</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {sortOptions.map(option => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => handleSortChange(option)}
                    className="cursor-pointer"
                  >
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-6 bg-border-tertiary   mx-1" />

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-md hover:bg-primary/20",
                activeView === "grid" && "text-primary"
              )}
              onClick={() => handleViewChange("grid")}
              title="Grid view"
            >
              <PiSquareSplitVerticalFill className="text-xl" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-md hover:bg-primary/20",
                activeView === "table" && " text-primary"
              )}
              onClick={() => handleViewChange("table")}
              title="Table view"
            >
              <PiListThin className="text-xl" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectControl;
