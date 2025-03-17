"use client";

import { useState, useEffect, useRef } from "react";
import {
  SquareTerminal,
  Github,
  Sun,
  Moon,
  Search,
  ChevronRight,
  ChevronLeft,
  LineChart,
  BookText,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

type ViewType = "dataExplorer" | "savedQueries";

interface AppSidebarProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

const AppSidebar = ({ currentView, setCurrentView }: AppSidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const theme = "dark";
  const viewOptions = [
    {
      id: "dataExplorer" as const,
      label: "Data Explorer",
      icon: SquareTerminal,
    },
    { id: "savedQueries" as const, label: "Saved Queries", icon: LineChart },
  ];

  const toggleTheme = () => {
    console.log("theme changed");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(prevOpen => !prevOpen);
      }

      // Toogle sidebar when pressing Cmd/Ctrl + B
      if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsExpanded(prevIsExpanded => !prevIsExpanded);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems = [
    { to: "/", label: "Home", icon: SquareTerminal, isNewWindow: false },
    { to: "/explore", label: "Explore", icon: LineChart, isNewWindow: false },
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
    <div
      ref={sidebarRef}
      className={`flex flex-col h-full dark border-r transition-all duration-300 bg-muted  ${
        isExpanded ? "w-64" : "w-16"
      }`}
    >
      <div className="p-2 ml-2 mt-2 flex items-center justify-between w-full">
        {isExpanded && (
          <Button
            variant="link"
            size="icon"
            onClick={() => setIsExpanded(false)}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
          </Button>
        )}
      </div>

      <Separator className="w-full" />
      <div className="p-3" />

      <ScrollArea className="flex-grow">
        <nav className="space-y-3 p-2">
          {viewOptions.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentView(item.id)}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === item.id
                  ? "bg-orange-600"
                  : "hover:bg-[#ffe814]/20"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isExpanded ? "mr-2" : ""}`} />
              {isExpanded && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </ScrollArea>

      <div className="w-full">
        <ScrollArea className="flex-grow">
          <nav className="space-y-1 p-2">
            {/*             <QueryHistory isExpanded={isExpanded} />
             */}{" "}
            {bottomNavLinks.map(item => (
              <Link
                key={item.to}
                href={item.to}
                target={item.isNewWindow ? "_blank" : "_self"}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.to
                    ? "bg-secondary text-secondary-foreground"
                    : "hover:bg-secondary/80"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isExpanded ? "mr-2" : ""}`} />
                {isExpanded && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </ScrollArea>
        <Separator className="w-full mb-2" />
        <div
          className={`${isExpanded ? "flex justify-around" : "block p-2.5"}`}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span className="text-xs">Search (Cmd/Ctrl + K)</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {!isExpanded && (
        <Button
          variant="ghost"
          size="icon"
          className="m-2"
          onClick={() => setIsExpanded(true)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {navItems.map(item => (
              <CommandItem
                key={item.to}
                onSelect={() => {
                  if (item.isNewWindow) {
                    window.open(item.to, "_blank");
                    setOpen(false);
                    return;
                  }
                  router.push(item.to);

                  setOpen(false);
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup>
            {bottomNavLinks.map(item => (
              <CommandItem
                key={item.to}
                onSelect={() => {
                  if (item.isNewWindow) {
                    window.open(item.to, "_blank");
                    setOpen(false);
                    return;
                  }
                  router.push(item.to);
                  setOpen(false);
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
                {item.isNewWindow && (
                  <ExternalLink
                    className="p-1 
                  "
                  />
                )}
              </CommandItem>
            ))}
            <CommandSeparator />
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => {
                toggleTheme();
                toast.info(
                  `Theme changed to ${theme === "dark" ? "light" : "dark"}`
                );
                setOpen(false);
              }}
            >
              {theme === "dark" ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              {theme === "dark" ? "Light Theme" : "Dark Theme"}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
};

export default AppSidebar;
