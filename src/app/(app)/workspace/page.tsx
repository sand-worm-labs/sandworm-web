"use client";

import { useState, useEffect, useCallback } from "react";

import AppSidebar from "@/components/AppSidebar";
import DataExplorer from "@/components/Explorer/DataExplorer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import WorkspaceTabs from "@/components/WorkSpace";
import { QueryHistory } from "@/components/Explorer/QueryHistory";
import { QueryExplorer } from "@/components/Explorer/QueryExplorer";
import { SettingsPanel } from "@/components/WorkSpace/SettingsPanel";

type ViewType =
  | "dataExplorer"
  | "queryExplorer"
  | "ChangeLog"
  | "settingsPanel";

interface PanelComponents {
  dataExplorer: React.ReactNode;
  queryExplorer: React.ReactNode;
  ChangeLog: React.ReactNode;
  settingsPanel: React.ReactNode;
}

export default function WorkSpace() {
  const [currentView, setCurrentView] = useState<ViewType>("dataExplorer");
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const panelComponents: PanelComponents = {
    dataExplorer: <DataExplorer />,
    queryExplorer: <QueryExplorer />,
    ChangeLog: <QueryHistory />,
    settingsPanel: <SettingsPanel />,
  };

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
        <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"}>
          {isMobile && (
            <ResizablePanel
              className="overflow-auto"
              defaultSize={50}
              minSize={40}
            >
              <WorkspaceTabs />
            </ResizablePanel>
          )}

          <ResizableHandle withHandle />

          <ResizablePanel
            className="overflow-auto"
            defaultSize={isMobile ? 50 : 25}
            minSize={isMobile ? 40 : 20}
          >
            {panelComponents[currentView]}
          </ResizablePanel>

          {!isMobile && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel
                className="overflow-auto"
                defaultSize={70}
                minSize={40}
              >
                <WorkspaceTabs />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
