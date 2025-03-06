import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function WorkSpace() {
  return (
    <div className="h-screen w-full overflow-auto border-t">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel className="overflow-scroll" defaultSize={25}>
          <div>Data Explorer</div>
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
  );
}
