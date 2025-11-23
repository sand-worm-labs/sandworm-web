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
  | "recently-viewed"
  | "your-favourites";

interface SortControlProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function SortControl({ sortBy, onSortChange }: SortControlProps) {
  return (
    <div className="flex flex-col gap-1 items-end">
      <Select
        value={sortBy}
        onValueChange={value => onSortChange(value as SortOption)}
      >
        <SelectTrigger className="w-[180px] border-[#CED4DA]  dark:border-[#262A30] bg-white dark:bg-black text-[#455768] dark:text-white h-8 rounded-lg cursor-pointer text-[0.8rem]">
          <TrendingUp className="h-3 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>

        <SelectContent className="bg-white dark:bg-black border-[#CED4DA] font-primary mt-2 text-[#455768] dark:text-[#868E96] dark:border-[#262A30] rounded-xl">
          <SelectItem
            className="hover:border-none hover:outline-none hover:bg-primary/20 dark:hover:text-white"
            value="trending"
          >
            Trending
          </SelectItem>
          <SelectItem
            className="hover:border-none hover:outline-none  hover:bg-primary/20 dark:hover:text-white"
            value="most-popular"
          >
            Most Popular
          </SelectItem>
          <SelectItem
            className="hover:border-none hover:outline-none  hover:bg-primary/20 dark:hover:text-white"
            value="recently-viewed"
          >
            Recently Viewed
          </SelectItem>
          <SelectItem
            className="hover:border-none hover:outline-none  hover:bg-primary/20 dark:hover:text-white"
            value="your-favourites"
          >
            Your Favourites
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
