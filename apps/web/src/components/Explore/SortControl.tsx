"use client";

import { TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sandworm/ui/components/select";

export type SortOption =
  | "trending"
  | "most-popular"
  | "your-forks"
  | "your-favourites";

interface SortControlProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  disabledOptions?: SortOption[];
}

export function SortControl({
  sortBy,
  onSortChange,
  disabledOptions = [],
}: SortControlProps) {
  const isDisabled = (opt: SortOption) => disabledOptions.includes(opt);

  return (
    <div className="flex flex-col gap-1 items-end">
      <Select value={sortBy} onValueChange={v => onSortChange(v as SortOption)}>
        <SelectTrigger className="w-[180px] border-border-tertiary dark:border-border-tertiary bg-white dark:bg-base-100 text-ink-200 dark:text-white h-8 rounded-lg cursor-pointer text-[0.8rem]">
          <TrendingUp className="h-3 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>

        <SelectContent className="bg-white dark:bg-base-100 border-border-tertiary font-body mt-2 text-ink-200 dark:text-ink-300 dark:border-border-tertiary rounded-xl">
          <SelectItem
            value="trending"
            className="hover:bg-primary/20 dark:hover:text-white"
          >
            Trending
          </SelectItem>
          <SelectItem
            value="most-popular"
            disabled={isDisabled("most-popular")}
            className="hover:bg-primary/20 dark:hover:text-white"
          >
            Most Popular
          </SelectItem>
          <SelectItem
            value="your-forks"
            disabled={isDisabled("your-forks")}
            className="hover:bg-primary/20 dark:hover:text-white"
          >
            Your Forks
          </SelectItem>
          <SelectItem
            value="your-favourites"
            disabled={isDisabled("your-favourites")}
            className="hover:bg-primary/20 dark:hover:text-white"
          >
            Your Favourites
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
