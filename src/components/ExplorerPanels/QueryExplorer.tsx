"use client";

import React, { useEffect, useState } from "react";
import { SquareTerminal, Plus, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

import { fetchUserQuery } from "@/services/axios/queryService";

import { CardHeader, CardTitle, CardContent, Card } from "../ui/card";
import { Button } from "../ui/button";

import { QueryExplorerCardList } from "./QueryExplorerCardList";
import { QueryResponse } from "@/types";

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-full gap-4 text-center text-muted-foreground">
    <Loader2 className="animate-spin h-6 w-6" />
    <p>Loading your queries…</p>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
    <div className="flex flex-col items-center gap-2">
      <SquareTerminal className="h-8 w-8 text-muted-foreground" />
      <p className="text-muted-foreground text-sm px-4">
        You haven't saved any queries yet. Create a query to get started
      </p>
    </div>
    <Button variant="outline" className="gap-2">
      <Plus className="h-4 w-4" />
      Create Query
    </Button>
  </div>
);

export const QueryExplorer = () => {
  const [queries, setQueries] = useState<QueryResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { data: session } = useSession();

  useEffect(() => {
    const loadQueries = async () => {
      if (!session?.user?.id) {
        return;
      }

      try {
        const uid = session?.user.id;
        const data = await fetchUserQuery(uid);
        setQueries(data?.queries?.page_items || []);
      } catch (err) {
        console.error("Error fetching queries:", err);
        setQueries([]);
      } finally {
        setLoading(false);
      }
    };

    loadQueries();
  }, []);

  return (
    <Card className="h-full overflow-hidden border-none dark">
      <CardHeader className="p-4 border-b ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 py-2">
            <SquareTerminal className="h-5 w-5" />
            <CardTitle className=" font-medium">Query Explorer</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 h-[calc(100%-60px)] overflow-y-auto">
        {loading && <LoadingState />}
        {!loading && queries.length === 0 && <EmptyState />}
        {!loading && queries.length > 0 && (
          <QueryExplorerCardList query={queries} />
        )}
      </CardContent>
    </Card>
  );
};
