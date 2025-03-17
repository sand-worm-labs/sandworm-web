"use client";

import { useState } from "react";

import AppSidebar from "@/components/AppSidebar";
import DataExplorer from "@/components/Explorer/DataExplorer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import WorkspaceTabs from "@/components/WorkSpace";
import { SavedQueries } from "@/components/WorkSpace/SavedQueries";

type ViewType = "dataExplorer" | "savedQueries";

interface PanelComponents {
  dataExplorer: React.ReactNode;
  savedQueries: React.ReactNode;
}

export default function WorkSpace() {
  const [currentView, setCurrentView] = useState<ViewType>("dataExplorer");

  const panelComponents: PanelComponents = {
    dataExplorer: <DataExplorer />,
    savedQueries: <SavedQueries />,
  };

  return (
    <div className="flex w-full h-[calc(100vh-4.8rem)] overflow-hidden">
      <AppSidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="h-[calc(100vh-4.8rem)] w-full overflow-auto border-t">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            className="overflow-scroll"
            defaultSize={25}
            minSize={20}
          >
            {panelComponents[currentView]}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            className="overflow-scroll"
            defaultSize={75}
            minSize={40}
          >
            <WorkspaceTabs />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
