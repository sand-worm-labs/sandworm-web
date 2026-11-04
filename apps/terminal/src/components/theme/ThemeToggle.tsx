"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@sandworm/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@sandworm/ui/components/dropdown-menu";
import clsx from "clsx";

import { Desktop, Moon, Sun } from "./theme-icons";

const THEME_OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Desktop },
] as const;

export function ThemeToggle({ iconSize = 22 }: { iconSize?: number }) {
  const { setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Toggle theme"
          title="Toggle theme"
          className="rounded-[10px] border border-transparent bg-transparent p-2 transition-colors hover:border-hover-border hover:bg-hover-bg dark:hover:bg-base-600"
        >
          <Sun
            size={iconSize}
            className="rotate-0 scale-100 text-ink-navy transition-all dark:-rotate-90 dark:scale-0 dark:text-white"
          />
          <Moon
            size={iconSize}
            className="absolute rotate-90 scale-0 text-ink-navy transition-all dark:rotate-0 dark:scale-100 dark:text-white"
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        aria-label="Theme options"
        className={clsx(
          "flex min-w-[9rem] flex-col gap-0.5 border-border bg-inputBg p-1 dark:border-border-tertiary",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
          "duration-150"
        )}
      >
        {THEME_OPTIONS.map(({ value, label, Icon }) => (
          <DropdownMenuItem
            key={value}
            aria-label={`${label} theme`}
            onClick={() => setTheme(value)}
            className="flex cursor-pointer items-center gap-2 rounded-[10px] border border-transparent px-2 py-1.5 text-ink-400 transition-colors hover:border-hover-border hover:bg-hover-bg dark:hover:bg-base-600 hover:dark:text-ink-100"
          >
            <Icon className="h-5 w-5 text-ink-500 dark:text-white" />
            <span className="text-sm">{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
