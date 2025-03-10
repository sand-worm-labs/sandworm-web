import React, { useState } from "react";
import { Play, Loader2, Lightbulb, Command, Edit } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSandwormStore } from "@/store";

import SQLEditor from "./SQLEditor";
import SaveModal from "../WorkSpace/SaveModal";

interface SqlEditorProps {
  tabId: string;
  title: string;
  className?: string;
}

const QueryEditor: React.FC<SqlEditorProps> = ({ tabId, title, className }) => {
  const { tabs, executeQuery, isExecuting, updateTabTitle, updateTabQuery } =
    useSandwormStore();

  const currentTab = tabs.find(tab => tab.id === tabId);
  const currentContent =
    currentTab?.type === "sql" && typeof currentTab.content === "string"
      ? currentTab.content
      : "";

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const handleExecuteQuery = async () => {
    const editor = "";
    if (!editor || isExecuting) return;

    const query = editor;

    try {
      await executeQuery(query, tabId);
    } catch (error) {
      console.error("Query execution failed:", error);
      toast.error("Query execution failed");
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTitle(e.target.value);
  };

  const handleTitleSubmit = () => {
    if (currentTitle.trim()) {
      updateTabTitle(tabId, currentTitle);
      setIsEditingTitle(false);
      toast.success(`Tab title updated to ${currentTitle}`);
    } else {
      setCurrentTitle(title);
      setIsEditingTitle(false);
      toast.error("Title cannot be empty");
    }
  };

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <Input
              className="text-sm font-medium truncate"
              value={currentTitle}
              onChange={handleTitleChange}
              onBlur={handleTitleSubmit}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  handleTitleSubmit();
                } else if (e.key === "Escape") {
                  setCurrentTitle(title);
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2">
              <span className=" font-medium truncate text-sm">
                {currentTitle}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleTitleEdit}
                className="group-hover:opacity-100 transition-opacity"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2 text-sm text-muted-foreground">
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger className="hover:bg-muted/50 p-2 rounded-md transition-colors">
                  <Lightbulb className="h-5 w-5 text-yellow-500/70 hover:text-yellow-500 transition-colors" />
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="w-72 p-0"
                  sideOffset={5}
                >
                  <div className="bg-card px-3 py-2 rounded-t-sm border-b">
                    <h4 className="font-medium flex items-center gap-2">
                      <Command className="h-4 w-4" />
                      SQL Editor Shortcuts
                    </h4>
                  </div>
                  <div className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Run Query</span>
                      <Badge variant="secondary" className="font-mono text-xs">
                        Ctrl + Enter
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Run Selected</span>
                      <Badge variant="secondary" className="font-mono text-xs">
                        Ctrl + Shift + Enter
                      </Badge>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button
            onClick={handleExecuteQuery}
            disabled={isExecuting}
            variant="outline"
            className="flex items-center gap-2 min-w-[100px]"
          >
            {isExecuting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isExecuting ? "Running..." : "Run Query"}
          </Button>
          <Button
            onClick={() => setIsSaveModalOpen(true)}
            variant="outline"
            className="flex items-center gap-2 min-w-[100px]"
          >
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        <SQLEditor
          initialValue={currentContent}
          tabId={tabId}
          executeQueryFn={executeQuery}
          updateTabQuery={updateTabQuery}
          theme="light"
        />
      </div>

      <SaveModal
        open={isSaveModalOpen}
        setOpen={setIsSaveModalOpen}
        title={currentTitle}
      />
    </div>
  );
};

export default QueryEditor;
