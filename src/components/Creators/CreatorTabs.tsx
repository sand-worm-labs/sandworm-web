import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HiOutlineCommandLine } from "react-icons/hi2";
import { FaRegStar } from "react-icons/fa";
import QueryList from "../QueryList";
import type { QueryResponse } from "@/types";

interface CreatorTabsProps {
  tab: string;
  setTab: (value: string) => void;
  queries: QueryResponse;
  starredQueries: QueryResponse;
}

export const CreatorTabs = ({
  tab,
  setTab,
  queries,
  starredQueries,
}: CreatorTabsProps) => {
  return (
    <div className="container mx-auto px-12 dark mt-5">
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
            value="starred"
            className={`px-4 py-2 flex items-center space-x-2 ${tab === "starred" ? "border-b-2 border-primary" : ""}`}
          >
            <FaRegStar size={16} />
            <span>Starred</span>
          </TabsTrigger>
        </TabsList>
        <div className="container mx-auto pt-2">
          <TabsContent value="all">
            <QueryList
              queries={queries.page_items}
              pagination={queries.pagination}
            />
          </TabsContent>
          <TabsContent value="starred">
            <QueryList
              queries={starredQueries.page_items}
              pagination={starredQueries.pagination}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
