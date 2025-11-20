"use client";

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@sandworm/ui/components/button";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list";

interface ViewControlProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewControl({ viewMode, onViewModeChange }: ViewControlProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onViewModeChange("grid")}
        className={cn(
          "h-8 w-8 rounded-md",
          viewMode === "grid" && "bg-accent text-[#A6554D]"
        )}
      >
        <LayoutGrid className="h-4 w-4" strokeWidth={2} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onViewModeChange("list")}
        className={cn(
          "h-8 w-8 rounded-md",
          viewMode === "list" && "bg-accent text-[#A6554D]"
        )}
      >
        <List className="h-5 w-5" strokeWidth={1.5} />
      </Button>
    </div>
  );
}
