import React, { useState } from "react";
import { Play, Loader2, Edit } from "lucide-react";
import { toast } from "sonner";
import { FaCodeBranch, FaRegStar } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSandwormStore } from "@/store";
import { useForkQuery } from "@/hooks";
import { SaveModal } from "@/components/WorkSpace";
import { QueryCodeEditor } from "@/components/WorkSpace/Editor";
import type { EditorTab } from "@/store";

interface SqlEditorProps {
  tabId: string;
  title: string;
  className?: string;
  selectedTab: EditorTab;
}

export const QueryEditor: React.FC<SqlEditorProps> = ({
  tabId,
  title,
  className,
  selectedTab,
}) => {
  const { tabs, executeQuery, isExecuting, updateTabTitle, updateTabQuery } =
    useSandwormStore();
  const editorTheme = useSandwormStore(
    state => state.settings.editorTheme
  )?.toLowerCase();
  const { handleFork, loading } = useForkQuery(selectedTab?.id ?? "");

  const currentTab = tabs.find(tab => tab.id === tabId);
  const currentContent =
    currentTab?.type === "sql" && typeof currentTab.content === "string"
      ? currentTab.content
      : "";

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const handleExecuteQuery = async () => {
    if (isExecuting) return;

    try {
      const query = currentContent;
      if (!query.trim()) {
        toast.error("Please enter a query to execute");
        return;
      }

      await executeQuery(query, tabId);
      toast.success("Query executed successfully");
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
      <div className="flex items-center justify-between px-4 py-2.5 border-b min-h-[3rem]">
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
                <TooltipTrigger
                  className="hover:bg-muted/50 p-2 rounded-md transition-colors border-white/20 border"
                  onClick={handleFork}
                  disabled={loading}
                >
                  <FaCodeBranch className="h-4 w-4 transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="bottom">Fork this Query</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger className="hover:bg-muted/50 p-2 rounded-md transition-colors border-white/20 border">
                  <FaRegStar className="h-4 w-4 transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="bottom">Star this Query</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button
            onClick={handleExecuteQuery}
            disabled={isExecuting}
            variant="default"
            className="flex items-center gap-2 min-w-[100px] bg-orange-700 text-sm font-medium h-[2rem] text-white rounded-sm"
          >
            {isExecuting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isExecuting ? "Running..." : "Run"}
          </Button>
          {!selectedTab.readonly && (
            <Button
              onClick={() => setIsSaveModalOpen(true)}
              variant="outline"
              className="flex items-center gap-2 min-w-[100px] text-sm font-medium  h-[2.2rem] rounded-sm"
            >
              Save
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 relative">
        <QueryCodeEditor
          initialValue={currentContent}
          tabId={tabId}
          updateTabQueryAction={updateTabQuery}
          onRunQuery={handleExecuteQuery}
          readonly={selectedTab.readonly}
          theme={editorTheme}
        />
      </div>

      <SaveModal
        open={isSaveModalOpen}
        setOpenAction={setIsSaveModalOpen}
        title={currentTitle}
        content={currentContent}
      />
    </div>
  );
};
