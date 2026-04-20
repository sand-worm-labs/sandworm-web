import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@sandworm/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@sandworm/ui/components/dropdown-menu";
import { Sun } from "../Assets/Sun";
import { Moon } from "../Assets/Moon";
import { Desktop } from "../Assets/Desktop";
import { TooltipV2 } from "@/components/Editor/blocks/ToolTips";
import clsx from "clsx";


export function ThemeTogggle() {
  const { setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="font-secondary">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <TooltipV2<HTMLButtonElement> title="Toggle theme" active={!open}   position="bottom"
        >
          {(ref) => (
            <DropdownMenuTrigger asChild>
              <Button
                ref={ref}
                variant="outline"
                aria-label="Toggle theme"
                className="border-none bg-transparent hover:bg-base-600 p-2 rounded-full"
                size="icon"
              >
                <Sun className="text-[#1C3B5A] dark:text-ink-400 h-[1.4rem] w-[1.4rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.4rem] w-[1.4rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
          )}
        </TooltipV2>

        <DropdownMenuContent
          align="end"
          aria-label="Theme options"
          className={clsx(
            "flex flex-row gap-1 p-1 py-1.5 min-w-0 border-[#DEE2E6] bg-[#F8F9FA]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
            "data-[side=bottom]:slide-in-from-top-1",
            "data-[side=top]:slide-in-from-bottom-1",
            "duration-150"
          )}
        >
          <TooltipV2<HTMLDivElement> title="Light" active  position="bottom">
            {(ref) => (
              <DropdownMenuItem
                ref={ref}
                aria-label="Light theme"
                onClick={() => setTheme("light")}
                className="p-2 rounded-md text-ink-400 focus:bg-base-600 cursor-pointer"
              >
                <Sun className="h-5 w-5 text-[#343A40]" aria-hidden="true" />
                <span className="sr-only">Light</span>
              </DropdownMenuItem>
            )}
          </TooltipV2>

          <TooltipV2<HTMLDivElement> title="Dark" active  position="bottom">
            {(ref) => (
              <DropdownMenuItem
                ref={ref}
                aria-label="Dark theme"
                onClick={() => setTheme("dark")}
                className="p-2 rounded-md text-ink-400 focus:bg-base-600 cursor-pointer"
              >
                <Moon className="h-5 w-5 text-[#343A40]" aria-hidden="true" />
                <span className="sr-only">Dark</span>
              </DropdownMenuItem>
            )}
          </TooltipV2>

          <TooltipV2<HTMLDivElement> title="System" active  position="bottom">
            {(ref) => (
              <DropdownMenuItem
                ref={ref}
                aria-label="System theme"
                onClick={() => setTheme("system")}
                className="p-2 rounded-md text-ink-400 focus:bg-base-600 cursor-pointer"
              >
                <Desktop className="h-5 w-5 text-[#343A40]" aria-hidden="true" />
                <span className="sr-only">System</span>
              </DropdownMenuItem>
            )}
          </TooltipV2>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}