"use client";

import React from "react";
import { MoreVertical, Edit2, Save, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@sandworm/ui/components/dropdown-menu";

export type Action = "rename" | "save" | "duplicate";

interface ItemActionsDropdownProps {
  /** Called when a menu action is selected */
  onAction?: (action: Action) => void;
  /** Optional className for the trigger button */
  className?: string;
}

export default function ItemActionsDropdown({
  onAction,
  className = "",
}: ItemActionsDropdownProps) {
  const handle = (action: Action) => {
    onAction?.(action);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="More options"
          className={`p-2 rounded-md transition-colors ${className}`}
        >
          <MoreVertical className="w-4 h-4 cursor-pointer hover:text-neutral-200 transition-colors" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-44 bg-white">
        <DropdownMenuItem
          onSelect={() => handle("rename")}
          className="flex items-center gap-2"
        >
          <Edit2 className="w-4 h-4" />
          Rename
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => handle("save")}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={() => handle("duplicate")}
          className="flex items-center gap-2"
        >
          <Copy className="w-4 h-4" />
          Duplicate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
