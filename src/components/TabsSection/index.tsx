"use client";

import { useState } from "react";
import { HiOutlineCommandLine } from "react-icons/hi2";
import { FaRegStar } from "react-icons/fa";
import { VscRepoForked } from "react-icons/vsc";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import QueryList from "@/components/QueryList";

import type { Query } from "@/services/firebase/db/QueryService";

interface TabSectionProps {
  queries: Query[];
}

export const TabsSection: React.FC<TabSectionProps> = ({ queries }) => {
  const [tab, setTab] = useState("all");

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="flex border-b border-borderLight">
        <TabsTrigger
          value="all"
          className={`px-4 py-2 flex items-center space-x-2 ${tab === "all" ? "border-b-2 border-primary" : ""}`}
        >
          <HiOutlineCommandLine size={18} />
          <span>All Queries</span>
        </TabsTrigger>
        <TabsTrigger
          value="forked"
          className={`px-4 py-2 flex items-center space-x-2 ${tab === "forked" ? "border-b-2 border-primary" : ""}`}
        >
          <VscRepoForked size={16} />
          <span> Forked</span>
        </TabsTrigger>
        <TabsTrigger
          value="starred"
          className={`px-4 py-2 flex items-center space-x-2 ${tab === "starred" ? "border-b-2 border-primary" : ""}`}
        >
          <FaRegStar size={16} /> <span>Starred</span>
        </TabsTrigger>
      </TabsList>
      <div className="container mx-auto pt-6">
        <TabsContent value="all">
          <QueryList queries={queries} />
        </TabsContent>
        <TabsContent value="forked">
          <QueryList queries={queries} />
        </TabsContent>
        <TabsContent value="starred">
          <QueryList queries={queries} />
        </TabsContent>
      </div>
    </Tabs>
  );
};
