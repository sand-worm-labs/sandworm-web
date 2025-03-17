import React from "react";
import { CardHeader, CardTitle, Card, CardContent } from "../ui/card";
import { SquareTerminal, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { QueryExplorerCardList } from "../Explorer/QueryExplorerCardList";

export const SavedQueries = () => {
  const queries = [
    {
      id: "query_12345",
      name: "Top 10 Sui Tokens",
    },
    {
      id: "query_12335",
      name: "Most Active Wallets",
    },
  ];
  return (
    <Card className="h-full overflow-hidden border-none dark">
      <CardHeader className="p-4 border-b ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 py-2">
            <SquareTerminal className="h-5 w-5 text-primary" />
            <CardTitle className=" font-semibold">Query Explorer</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-2 h-[calc(100%-60px)] overflow-y-auto">
        {queries.length > 0 ? (
          <QueryExplorerCardList query={queries} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <SquareTerminal className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground text-sm px-2">
                You haven't saved any queries yet. Create a query to get started
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Query
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
