"use client";

import { useMemo } from "react";
import { Terminal, GitFork, Star } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

type Tab = "all" | "forked" | "starred";

// =====================================
// ⬢ QueryTabs - should be explore tab
// =====================================
export function QueryTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabs = [
    { id: "all" as Tab, label: "All Queries", icon: Terminal },
    { id: "forked" as Tab, label: "Forked", icon: GitFork },
    { id: "starred" as Tab, label: "Starred", icon: Star },
  ];

  const activeTab = useMemo<Tab>(() => {
    const fromUrl = searchParams.get("tab");
    if (fromUrl === "forked" || fromUrl === "starred" || fromUrl === "all") {
      return fromUrl;
    }
    return "all";
  }, [searchParams]);

  function handleSelectTab(tab: Tab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex items-center gap-2">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            type="button"
            key={tab.id}
            onClick={() => handleSelectTab(tab.id)}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors",
              isActive
                ? "text-destructive"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
