"use client";

import { Rows3, Rows2, TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sandworm/ui/components/select";
import { Button } from "@sandworm/ui/components/button";

import { cn } from "@/lib/utils";

import type { ViewMode, SortOption } from "./QueriesList";

interface ViewControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function ViewControls({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
}: ViewControlsProps) {
  return (
    <div className="flex flex-col gap-1 items-end">
      <div className="flex items-center gap-1 w-fit rounded-md p-1 self-end">
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-7 w-7", viewMode === "compact" && "bg-accent")}
          onClick={() => onViewModeChange("compact")}
        >
          <Rows3
            className={cn("h-4 w-4", viewMode === "compact" && "text-primary")}
            strokeWidth={viewMode === "compact" ? 2.5 : 2}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-7 w-7", viewMode === "detailed" && "bg-accent")}
          onClick={() => onViewModeChange("detailed")}
        >
          <Rows2
            className={cn("h-4 w-4", viewMode === "detailed" && "text-primary")}
            strokeWidth={viewMode === "detailed" ? 2.5 : 2}
          />
        </Button>
      </div>

      <Select
        value={sortBy}
        onValueChange={value => onSortChange(value as SortOption)}
      >
        <SelectTrigger className="w-[180px]">
          <TrendingUp className="h-3 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="trending">Trending</SelectItem>
          <SelectItem value="most-popular">Most Popular</SelectItem>
          <SelectItem value="recently-viewed">Recently Viewed</SelectItem>
          <SelectItem value="your-favourites">Your Favourites</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
