import React, { useState } from "react";
import { FileX2 } from "lucide-react";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@sandworm/ui/components/resizable";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@sandworm/ui/components/alert";

import { useSandwormStore } from "@/store";

import QueryResultsTable from "./ResultTab/index";
import { ResultToolbar } from "./ResultTab/ResultToolbar";
import { QueryEditor } from "./Editor/QueryEditor";

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
        <div className="h-full flex items-center justify-center relative border-t border-[#E9ECEF] dark:border-[#262A30]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, #E2E8F0 4px, transparent 3px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div
            className="absolute inset-0 [--gradient-color:white] dark:[--gradient-color:oklch(0.145_0_0)]"
            style={{
              background:
                "radial-gradient(ellipse 80% 120% at 50% 0%, transparent 0%, var(--gradient-color) 70%)",
            }}
          />
          <div className="flex flex-col items-center relative z-10">
            <FileX2
              size={48}
              className="text-[#868E96] dark:text-white mb-4"
              strokeWidth={1.5}
            />
            <p className="text-sm text-[#868E96] dark:text-white text-center">
              There's no data yet! Run a query to get started.
            </p>
          </div>
        </div>
      );
    }

    // Show error if query failed
    if (currentTab.result.error) {
      return (
        <div className="h-full flex items-center justify-center relative border-t border-[#E9ECEF]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, #E2E8F0 4px, transparent 3px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 120% at 50% 0%, transparent 0%, white 70%)",
            }}
          />
          <div className="flex flex-col px-5 w-full relative z-10">
            <Alert variant="destructive">
              <AlertTitle>Query Error</AlertTitle>
              <AlertDescription>{currentTab.result.error}</AlertDescription>
            </Alert>

            <p className="text-sm text-[#868E96] mt-4 text-center">
              Not sure what went wrong? You can check out our{" "}
              <a
                href="https://docs.sandwormlabs.xyz/faq"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 underline underline-offset-2 hover:text-orange-700"
              >
                FAQ
              </a>{" "}
              or review our{" "}
              <a
                href="https://docs.sandwormlabs.xyz/sql-syntax/itro"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 underline underline-offset-2 hover:text-orange-700"
              >
                SQL syntax guide
              </a>{" "}
              to troubleshoot.
            </p>
          </div>
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
        <ResizablePanel defaultSize={40} minSize={25} className="relative px-6">
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
