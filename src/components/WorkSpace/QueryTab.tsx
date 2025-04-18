import React, { useState } from "react";
import { FileX2 } from "lucide-react";

import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useSandwormStore } from "@/store";

import QueryEditor from "../Editor/QueryEditor";

import QueryResultsTable from "./ResultTab/index";
import { ResultToolbar } from "./ResultTab/ResultToolbar";

interface QueryTabProps {
  tabId: string;
}

export const QueryTab: React.FC<QueryTabProps> = ({ tabId }) => {
  const { tabs, isExecuting } = useSandwormStore();
  const [viewMode, setViewMode] = useState<string>("Table");
  const currentTab = tabs.find(tab => tab.id === tabId);

  const renderResults = () => {
    if (!currentTab || currentTab.type !== "sql") {
      return null;
    }

    if (isExecuting) {
      return (
        <div className="h-full p-4 flex items-center justify-center">
          <svg
            className="worm"
            x="0px"
            y="0px"
            viewBox="0 0 316 40"
            enableBackground="new 0 0 316 40"
            xmlSpace="preserve"
          >
            <path
              d="M6.5,6.5c30,0,30,26.9,60,26.9c30,0,30-26.9,60-26.9c30,0,30,26.9,60,26.9c30,0,30-26.9,60-26.9
c30,0,30,26.9,60,26.9"
            />
          </svg>
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

    return (
      <div className="h-full">
        {currentTab.result && (
          <>
            <ResultToolbar viewMode={viewMode} setViewMode={setViewMode} />
            <QueryResultsTable
              result={currentTab.result}
              viewMode={viewMode}
              title={currentTab.title}
              query={currentTab.content as string}
            />
          </>
        )}
      </div>
    );
  };

  if (!currentTab || currentTab.type !== "sql") {
    return null;
  }

  return (
    <div className="h-full">
      <ResizablePanelGroup direction="vertical" className="relative">
        <ResizablePanel defaultSize={40} minSize={25} className="relative">
          <QueryEditor
            tabId={tabId}
            title={currentTab.title}
            selectedTab={currentTab}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={60}
          minSize={25}
          className="relative overflow-visible"
        >
          {renderResults()}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
