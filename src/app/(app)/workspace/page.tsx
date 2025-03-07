import AppSidebar from "@/components/AppSidebar";
import DataExplorer from "@/components/Explorer/DataExplorer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function WorkSpace() {
  return (
    <div className="flex w-full h-[calc(100vh-4.8rem)] overflow-hidden">
      <AppSidebar />
      <div className="h-[calc(100vh-4.8rem)] w-full overflow-auto border-t">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel className="overflow-scroll" defaultSize={25}>
            <DataExplorer />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            className="overflow-scroll"
            defaultSize={75}
            minSize={40}
          >
            <div>WorkSpace Tab</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
