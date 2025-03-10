// src/components/workspace/SqlTab.tsx
import React, { useState } from "react";

import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";

import { FileX2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "../ui/skeleton";
/* import QueryEditor from "../Editor/QueryEditor";
 */ import { useSandwormStore } from "@/store";
import QueryEditor from "../Editor/QueryEditor";

interface QueryTabProps {
  tabId: string;
}

export const QueryTab: React.FC<QueryTabProps> = ({ tabId }) => {
  const { tabs, isExecuting } = useSandwormStore();
  const currentTab = tabs.find(tab => tab.id === tabId);
  const [results, setResults] = useState<any[]>([]);

  const executeQuery = async (query: string, tabId: string) => {
    try {
      // Your logic for executing the query
      console.log(`Executing query in tab ${tabId}: ${query}`);
      // Mock results for demonstration
      setResults([{ id: 1, name: "Test Result" }]);
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  };

  const renderResults = () => {
    if (!currentTab || currentTab.type !== "sql") {
      return null;
    }

    // Show skeleton loader while executing query

    if (isExecuting) {
      return (
        <div className="h-full p-4">
          {/* Table Skeleton */}
          <div className="space-y-4">
            {/* Skeleton Header */}
            <div className="flex space-x-4">
              {Array.from({ length: 15 }).map((_, index) => (
                <Skeleton key={`header-${index}`} className="h-4 w-32" />
              ))}
            </div>

            {/* Skeleton Rows */}
            <div className="space-y-2">
              {Array.from({ length: 22 }).map((_, rowIndex) => (
                <Skeleton key={`row-${rowIndex}`} className="flex space-x-4">
                  {Array.from({ length: 5 }).map((_, colIndex) => (
                    <div
                      key={`cell-${rowIndex}-${colIndex}`}
                      className="h-5 w-24 rounded-md animate-pulse"
                    />
                  ))}
                </Skeleton>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Show empty state if no query has been run
    if (!currentTab.result) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center">
            <FileX2 size={48} className="text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              There's no data yet! Run a query to get started.
            </p>
          </div>
        </div>
      );
    }

    // Show error if query failed
    if (currentTab.result.error) {
      return (
        <div className="m-4">
          <Alert variant="destructive">
            <AlertTitle>Query Error</AlertTitle>
            <AlertDescription>{currentTab.result.error}</AlertDescription>
          </Alert>
        </div>
      );
    }

    // Show results table
    return <div className="h-full">Result Table</div>;
  };

  if (!currentTab || currentTab.type !== "sql") {
    return null;
  }

  return (
    <div className="h-full">
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={50} minSize={25}>
          <QueryEditor tabId={tabId} title={currentTab.title} />

          {/*     <SQLEditor
            initialContent="SELECT * FROM users WHERE id = 1;"
            tabId="tab-1"
            executeQueryFn={executeQuery}
            theme="light"
          /> */}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={25}>
          {renderResults()}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
