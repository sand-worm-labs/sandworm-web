"use client";

import { useState, useEffect, useCallback } from "react";

import { AppSidebar } from "@/components/Layout/AppSidebar";
import { DataExplorer } from "@/components/ExplorerPanels/DataExplorer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { WorkspaceTabs } from "@/components/Console/WorkspaceTabs";
import { QueryHistory } from "@/components/ExplorerPanels/QueryHistory";
import { QueryExplorer } from "@/components/ExplorerPanels/QueryExplorer";
import { SettingsPanel } from "@/components/Console/SettingsPanel";
import { WormAiPanel } from "@/components/Console/WormAIPanel";
import type { Query } from "@/types";
import { Button } from "../ui/button";
import { Icons } from "../icons";

type ViewType =
  | "dataExplorer"
  | "queryExplorer"
  | "ChangeLog"
  | "wormbot"
  | "settingsPanel";

// interface PanelComponents {
//   dataExplorer: React.ReactNode;
//   queryExplorer: React.ReactNode;
//   ChangeLog: React.ReactNode;
//   settingsPanel: React.ReactNode;
//   wormbot: React.ReactNode;
// }

interface WorkSpaceProps {
  initialQuery?: Query;
  currentUserId: string;
}

export const WorkSpace = ({ initialQuery, currentUserId }: WorkSpaceProps) => {
  const [currentView, setCurrentView] = useState<ViewType>("dataExplorer");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showExplorer, setShowExplorer] = useState(false);


  // const panelComponents: PanelComponents = {
  //   dataExplorer: <DataExplorer />,
  //   queryExplorer: <QueryExplorer />,
  //   ChangeLog: <QueryHistory queryId={initialQuery?.id} />,
  //   settingsPanel: <SettingsPanel />,
  //   wormbot: <WormAiPanel />,
  // };

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  return (
    <div className="flex w-full h-[calc(100vh-3.4rem)] overflow-hidden  md:flex-row">
      <AppSidebar currentView={currentView} setCurrentView={setCurrentView} />

      <div className="flex-1 h-full overflow-auto border-t">
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

          {/* <ResizablePanel
            className="overflow-scroll hidden md:block"
            defaultSize={isMobile ? 50 : 25}
            minSize={isMobile ? 40 : 20}
          >
            {panelComponents[currentView]}
          </ResizablePanel> */}

          {!showExplorer && (
            <Button
              onClick={() => setShowExplorer(true)}
              variant="outline"
              className="shadow-none border-none fixed bottom-20 right-3 z-50 pointer-events-auto flex items-start flex-col gap-2 px-3 py-2 text-sm cursor-pointer"
            >
              <span>Data Explorers</span>
              <Icons.Database className="h-6 w-6 shrink-0" />
            </Button>
          )}
          {showExplorer && (
            <DataExplorer onClose={() => setShowExplorer(false)} />
          )}

          {!isMobile && (
            <>
              <ResizableHandle withHandle />
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
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
};
