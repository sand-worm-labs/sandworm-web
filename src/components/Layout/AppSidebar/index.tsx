"use client";

import { GiBackwardTime } from "react-icons/gi";
import {
  SquareTerminal,
  Github,
  BookText,
  Database,
  Settings,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ViewType =
  | "dataExplorer"
  | "queryExplorer"
  | "ChangeLog"
  | "settingsPanel";

interface AppSidebarProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

export const AppSidebar = ({
  currentView,
  setCurrentView,
}: AppSidebarProps) => {
  const viewOptions = [
    { id: "dataExplorer" as const, label: "Data Explorer", icon: Database },
    {
      id: "queryExplorer" as const,
      label: "Saved Queries",
      icon: SquareTerminal,
    },
    { id: "ChangeLog" as const, label: "ChangeLog", icon: GiBackwardTime },
  ];

  const bottomNavLinks = [
    {
      to: "https://github.com/sand-worm-sql",
      label: "GitHub",
      icon: Github,
      isNewWindow: true,
    },
    {
      to: "/",
      label: "Documentation",
      icon: BookText,
      isNewWindow: true,
    },
  ];

  return (
    <TooltipProvider>
      <div className="h-full w-16 bg-muted border-r flex flex-col items-center py-4 space-y-4 dark pt-12">
        <ScrollArea className="flex-grow ">
          {viewOptions.map(item => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors w-full mb-5 ${
                    currentView === item.id
                      ? " border-l-4 border-orange-600 rounded-none"
                      : "hover:bg-white/15"
                  }`}
                  onClick={() => setCurrentView(item.id)}
                >
                  <item.icon className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <span className="text-sm">{item.label}</span>
              </TooltipContent>
            </Tooltip>
          ))}
        </ScrollArea>

        <div className="space-y-3">
          {bottomNavLinks.map(item => (
            <Tooltip key={item.to}>
              <TooltipTrigger asChild>
                <Link
                  href={item.to}
                  target={item.isNewWindow ? "_blank" : "_self"}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-full"
                    aria-label={item.label}
                  >
                    <item.icon className="h-6 w-6" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <span className="text-sm">{item.label}</span>
              </TooltipContent>
            </Tooltip>
          ))}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={
                  currentView === "settingsPanel" ? "secondary" : "ghost"
                }
                size="icon"
                className="mx-auto"
                onClick={() => setCurrentView("settingsPanel")}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span className="text-sm">Settings</span>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};
