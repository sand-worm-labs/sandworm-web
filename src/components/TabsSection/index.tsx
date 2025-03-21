"use client";

import { useState } from "react";
import { HiOutlineCommandLine } from "react-icons/hi2";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import QueryList from "@/components/QueryList";

export default function TabsSection() {
  const [tab, setTab] = useState("all");

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="flex border-b border-borderLight">
        <TabsTrigger
          value="all"
          className={`px-4 py-2 flex items-center space-x-2 ${tab === "all" ? "border-b-2 border-primary" : ""}`}
        >
          <HiOutlineCommandLine className="text-xl" />
          <span>All Queries</span>
        </TabsTrigger>
        <TabsTrigger
          value="forked"
          className={`px-4 py-2 ${tab === "forked" ? "border-b-2 border-primary" : ""}`}
        >
          Forked
        </TabsTrigger>
        <TabsTrigger
          value="starred"
          className={`px-4 py-2 ${tab === "starred" ? "border-b-2 border-primary" : ""}`}
        >
          Starred
        </TabsTrigger>
      </TabsList>
      <div className="container mx-auto pt-6">
        <TabsContent value="all">
          <QueryList />
        </TabsContent>
        <TabsContent value="forked">
          <QueryList />
        </TabsContent>
        <TabsContent value="starred">
          <QueryList />
        </TabsContent>
      </div>
    </Tabs>
  );
}
