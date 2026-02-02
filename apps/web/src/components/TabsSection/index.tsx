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
import type { QueryResponse } from "@/types";

import { EmptyQueryState } from "../EmptyState/EmptyQueryState";
import { SortControl } from "../Explore/SortControl";
import { ViewControl } from "../Explore/ViewControl";
import { FeaturedExploreSection } from "../Explore/FeaturedExploreSection";

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

// =====================================
// ⬢ Tabs Header Component
// =====================================
const TabsHeader: React.FC<{
  tab: string;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}> = ({ tab, sortBy, onSortChange }) => (
  <div className="flex justify-between items-center">
    <TabsList className="flex ">
      <TabsTrigger
        value="all"
        className={`px-3 py-1 flex items-center space-x-1.5 rounded-lg ${
          tab === "all" ? "text-primary bg-[#E7F3F6]" : "text-ink-300 "
        }`}
      >
        <HiOutlineCommandLine size={18} className="flex-shrink-0" />
        <span className="text-sm">All Notebooks</span>
      </TabsTrigger>

      <TabsTrigger
        value="forked"
        className={`px-3 py-1 flex items-center space-x-1.5 rounded-lg ${
          tab === "forked" ? "text-primary bg-[#E7F3F6]" : "text-ink-300 "
        }`}
      >
        <VscRepoForked size={16} className="flex-shrink-0" />
        <span className="text-sm">Forked </span>
      </TabsTrigger>

      <TabsTrigger
        value="starred"
        className={`px-3 py-1 flex items-center space-x-1.5 rounded-lg ${
          tab === "starred" ? "text-primary bg-[#E7F3F6]" : "text-ink-300 "
        }`}
      >
        <FaRegStar size={16} className="flex-shrink-0" />
        <span className="text-sm">Starred</span>
      </TabsTrigger>
    </TabsList>

    <SortControl sortBy={sortBy} onSortChange={onSortChange} />
  </div>
);

// =====================================
// ⬢ Tab Content Component
// =====================================
const TabContentArea: React.FC<{
  queries: QueryResponse | null;
  forkedQueries: QueryResponse | null;
  starredQueries: QueryResponse | null;
}> = ({ queries, forkedQueries, starredQueries }) => (
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
  }, [tab, searchParams, router]);

  return (
    <div>
      <div className="flex justify-between">
        <p className="text-ink-200 dark:text-ink-300  text-sm mb-6 mt-4">
          Discover the latest trends in the crypto ecosystem.
        </p>
        <ViewControl viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      <div className=" w-full container mx-auto">
        <FeaturedExploreSection />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsHeader tab={tab} sortBy={sortBy} onSortChange={setSortBy} />
        <TabContentArea
          queries={queries}
          forkedQueries={forkedQueries}
          starredQueries={starredQueries}
        />
      </Tabs>
    </div>
  );
};
