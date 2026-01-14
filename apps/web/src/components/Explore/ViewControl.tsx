"use client";

import { Button } from "@sandworm/ui/components/button";
import { PiSquareSplitVerticalFill, PiListThin } from "react-icons/pi";

import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list";

interface ViewControlProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewControl({ viewMode, onViewModeChange }: ViewControlProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onViewModeChange("grid")}
        className={cn(
          "h-8 w-8 rounded-md",
          viewMode === "grid" && "bg-accent text-[#A308F0]"
        )}
      >
        <PiSquareSplitVerticalFill className="text-xl" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onViewModeChange("list")}
        className={cn(
          "h-8 w-8 rounded-md",
          viewMode === "list" && "bg-accent text-[#A308F0]"
        )}
      >
        <PiListThin className="text-xl" />
      </Button>
    </div>
  );
}
