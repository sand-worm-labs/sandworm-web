"use client";

import { useState, useEffect, useCallback } from "react";
import { DatabaseIcon } from "lucide-react";
import {
  ResizablePanel,
  ResizablePanelGroup,
} from "@sandworm/ui/components/resizable";
import { Button } from "@sandworm/ui/components/button";

import { DataExplorer } from "@/components/ExplorerPanels/DataExplorer";
import { WorkspaceTabs } from "@/components/Console/WorkspaceTabs";
import type { Query } from "@/types";

// =====================================
// 🎨 Interface / Props Definition
// =====================================

interface WorkSpaceProps {
  initialQuery?: Query;
  currentUserId: string;
}

// ⚛️ =====================================
// Workspace component
// =====================================
export const WorkSpace = ({ initialQuery, currentUserId }: WorkSpaceProps) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showExplorer, setShowExplorer] = useState(false);

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  return (
    <div className="flex w-full h-[calc(100vh-3.4rem)] overflow-hidden md:flex-row relative">
      <div className="flex-1 h-full overflow-x-hidden border-t border-base-200 dark:border-border-tertiary">
        <ResizablePanelGroup direction="horizontal">
          {isMobile && (
            <ResizablePanel
              className="overflow-auto"
              defaultSize={50}
              minSize={40}
            >
              <WorkspaceTabs
                initialQuery={initialQuery}
                currentUserId={currentUserId}
              />
            </ResizablePanel>
          )}

          {!isMobile && (
            <ResizablePanel
              className="overflow-auto"
              defaultSize={75}
              minSize={40}
            >
              <WorkspaceTabs
                initialQuery={initialQuery}
                currentUserId={currentUserId}
              />
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </div>

      {!showExplorer && (
        <Button
          onClick={() => setShowExplorer(true)}
          variant="outline"
          className="shadow-none border-none fixed bottom-20 right-3 z-50 pointer-events-auto flex items-start flex-col gap-2 px-3 py-2 text-sm bg-transparent cursor-pointer hover:bg-transparent"
        >
          <span>Data Explorers</span>
          <div className="bg-[#ECF6FF] border-[3px] border-border-secondary  dark:border-border-tertiary rounded-xl p-2.5">
            <DatabaseIcon className="h-5 w-5 text-accent shrink-0" />
          </div>
        </Button>
      )}

      {showExplorer && <DataExplorer onClose={() => setShowExplorer(false)} />}
    </div>
  );
};
