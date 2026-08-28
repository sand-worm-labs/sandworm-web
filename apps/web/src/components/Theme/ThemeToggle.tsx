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

import { TooltipV2 } from "@/components/Editor/blocks/ToolTips";

import { Sun } from "../Assets/Sun";
import { Moon } from "../Assets/Moon";
import { Desktop } from "../Assets/Desktop";

interface ThemeToggleProps {
  iconSize?: number;
}

const THEME_OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Desktop },
] as const;

export function ThemeTogggle({ iconSize = 22 }: ThemeToggleProps) {
  const { setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="font-secondary">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <TooltipV2<HTMLButtonElement>
          title="Toggle theme"
          active={!open}
          position="bottom"
        >
          {ref => (
            <DropdownMenuTrigger asChild>
              <Button
                ref={ref}
                variant="outline"
                aria-label="Toggle theme"
                className="border border-transparent bg-transparent hover:bg-hover-bg hover:border-hover-border dark:hover:bg-base-600 p-2 rounded-[10px] transition-colors"
                size="icon"
              >
                <Sun
                  size={iconSize}
                  className="text-ink-navy dark:text-ink-400 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                />
                <Moon
                  size={iconSize}
                  className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
          )}
        </TooltipV2>

        <DropdownMenuContent
          align="end"
          aria-label="Theme options"
          className={clsx(
            "flex flex-col gap-0.5 p-1 min-w-[9rem] border-border bg-inputBg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
            "data-[side=bottom]:slide-in-from-top-1",
            "data-[side=top]:slide-in-from-bottom-1",
            "duration-150"
          )}
        >
          {THEME_OPTIONS.map(({ value, label, Icon }) => (
            <DropdownMenuItem
              key={value}
              aria-label={`${label} theme`}
              onClick={() => setTheme(value)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-[10px] border border-transparent text-ink-400 hover:bg-hover-bg hover:border-hover-border dark:hover:bg-base-600 hover:dark:text-ink-100 cursor-pointer transition-colors"
            >
              <Icon className="h-5 w-5 text-ink-500" aria-hidden="true" />
              <span className="text-sm">{label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
