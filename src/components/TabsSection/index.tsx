"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HiOutlineCommandLine } from "react-icons/hi2";
import { FaRegStar } from "react-icons/fa";
import { VscRepoForked } from "react-icons/vsc";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { QueryList } from "@/components/Queries/QueryList";
import type { QueryResponse } from "@/types";
import { EmptyQueryState } from "../EmptyState/EmptyQueryState";

interface TabSectionProps {
  queries: QueryResponse | null;
  starredQueries: QueryResponse | null;
  forkedQueries: QueryResponse | null;
  defaultTab?: string;
}

export const TabsSection: React.FC<TabSectionProps> = ({
  queries,
  defaultTab,
  forkedQueries,
  starredQueries,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(defaultTab || "all");

  useEffect(() => {
    const current = searchParams?.get("tab");
    if (current !== tab) {
      const params = new URLSearchParams(searchParams?.toString() || "");
      params.set("tab", tab);
      router.replace(`?${params.toString()}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [tab]);

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="flex border-b border-borderLight">
        <TabsTrigger
          value="all"
          className={`md:px-4 px-2 py-2 flex md:items-center space-x-2 ${tab === "all" ? "border-b-2 border-primary" : ""}`}
        >
          <HiOutlineCommandLine size={18} />
          <span className="text-sm">All Queries</span>
        </TabsTrigger>
        <TabsTrigger
          value="forked"
          className={`md:px-4 px-2 py-2 flex md:items-center space-x-2 ${tab === "forked" ? "border-b-2 border-primary" : ""}`}
        >
          <VscRepoForked size={16} />
          <span className="text-sm"> Forked</span>
        </TabsTrigger>
        <TabsTrigger
          value="starred"
          className={`md:px-4 px-2 py-2 flex md:items-center space-x-2 ${tab === "starred" ? "border-b-2 border-primary" : ""}`}
        >
          <FaRegStar size={16} /> <span className="text-sm">Starred</span>
        </TabsTrigger>
      </TabsList>
      <div className="container mx-auto pt-6">
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
    </Tabs>
  );
};
