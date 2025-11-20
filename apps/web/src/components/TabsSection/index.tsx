"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HiOutlineCommandLine } from "react-icons/hi2";
import { FaRegStar } from "react-icons/fa";
import { VscRepoForked } from "react-icons/vsc";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@sandworm/ui/components/tabs";

import { QueryList } from "@/components/Queries/QueryList";
import { EmptyQueryState } from "../EmptyState/EmptyQueryState";
import { SortControl } from "../Explore/SortControl";

import type { QueryResponse } from "@/types";
import { ViewControl } from "../Explore/ViewControl";

// 🎨 Interfaces and Types
// =====================================
export type SortOption =
  | "trending"
  | "most-popular"
  | "recently-viewed"
  | "your-favourites";

export type ViewMode = "grid" | "list";

interface TabSectionProps {
  queries: QueryResponse | null;
  starredQueries: QueryResponse | null;
  forkedQueries: QueryResponse | null;
  defaultTab?: string;
}

// TAB SECTION COMPONENT
// =====================================
export const TabsSection: React.FC<TabSectionProps> = ({
  queries,
  defaultTab,
  forkedQueries,
  starredQueries,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(defaultTab || "all");
  const [sortBy, setSortBy] = useState<SortOption>("trending");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // ═══ 🔁 Sync tab → URL  ═══
  useEffect(() => {
    const current = searchParams?.get("tab");
    if (current !== tab) {
      const params = new URLSearchParams(searchParams?.toString() || "");
      params.set("tab", tab);
      router.replace(`?${params.toString()}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [tab]);

  // =====================================
  // ⬢ Tabs Header
  // =====================================
  const TabsHeader = () => (
    <div className="flex justify-between items-center">
      <TabsList className="flex border-b border-borderLight">
        <TabsTrigger
          value="all"
          className={`px-2 py-2 flex items-center space-x-2 ${
            tab === "all" ? "text-[#A6554D]" : "text-[#868E96]"
          }`}
        >
          <HiOutlineCommandLine size={18} className="flex-shrink-0" />
          <span className="text-sm">All Insights</span>
        </TabsTrigger>

        <TabsTrigger
          value="forked"
          className={`px-2 py-2 flex items-center space-x-2 ${
            tab === "forked" ? "text-[#A6554D]" : "text-[#868E96]"
          }`}
        >
          <VscRepoForked size={16} className="flex-shrink-0" />
          <span className="text-sm">Dashboards</span>
        </TabsTrigger>

        <TabsTrigger
          value="starred"
          className={`px-2 py-2 flex items-center space-x-2 ${
            tab === "starred" ? "text-[#A6554D]" : "text-[#868E96]"
          }`}
        >
          <FaRegStar size={16} className="flex-shrink-0" />
          <span className="text-sm">Reports</span>
        </TabsTrigger>
      </TabsList>

      <SortControl sortBy={sortBy} onSortChange={setSortBy} />
    </div>
  );

  // =====================================
  // ⬢ Render Tab Content
  // =====================================
  const RenderTabContent = () => (
    <div className="container mx-auto">
      <TabsContent value="all">
        {queries ? (
          <QueryList
            queries={queries.page_items}
            pagination={queries.pagination}
          />
        ) : (
          <EmptyQueryState message="No queries available." />
        )}
      </TabsContent>

      <TabsContent value="forked">
        {forkedQueries ? (
          <QueryList
            queries={forkedQueries.page_items}
            pagination={forkedQueries.pagination}
          />
        ) : (
          <EmptyQueryState message="No forked queries found." />
        )}
      </TabsContent>

      <TabsContent value="starred">
        {starredQueries ? (
          <QueryList
            queries={starredQueries.page_items}
            pagination={starredQueries.pagination}
          />
        ) : (
          <EmptyQueryState message="No starred queries yet." />
        )}
      </TabsContent>
    </div>
  );

  // =====================================
  // ⬢ Main Component
  // =====================================

  return (
    <div>
      <div className="flex justify-between">
        <p className="text-[#455768] text-sm mb-8 mt-6">
          See what others are creating using Sandworm
        </p>
        <ViewControl viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsHeader />
        <RenderTabContent />
      </Tabs>
    </div>
  );
};
