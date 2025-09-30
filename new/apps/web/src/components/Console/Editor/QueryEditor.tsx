import React, { useState } from "react";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import { FaCodeBranch } from "react-icons/fa";
import { useSession } from "next-auth/react";

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
import { SaveModal } from "@/components/Console";
import { QueryCodeEditor } from "@/components/Console/Editor";
import type { EditorTab } from "@/store";
import { useModalStore } from "@/store/auth";

import { ExecuteButton } from "./ExecuteButton";

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
  const {
    tabs,
    executeQuery,
    isExecuting,
    updateTabTitle,
    updateTabQuery,
    setExecutionType,
    cancelQueryExecution,
  } = useSandwormStore();
  const editorTheme = useSandwormStore(state => state.settings.editorTheme);
  const { data: session } = useSession();
  const { handleFork, loading } = useForkQuery(selectedTab?.id ?? "");
  const openSignIn = useModalStore(state => state.openSignIn);

  const currentTab = tabs.find(tab => tab.id === tabId);
  const currentContent =
    currentTab?.type === "sql" && typeof currentTab.content === "string"
      ? currentTab.content
      : "";
  const executionType = currentTab?.executionType ?? "rpc";

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

      await executeQuery(query, tabId, { executionMethod: executionType });
      toast.success("Query executed successfully");
    } catch (error) {
      console.error("Query execution failed:", error);
      toast.error("Query execution failed");
    }
  };

  const handleSetExecutionType = (type: "rpc" | "indexed") => {
    setExecutionType(tabId, type);
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

  const handleForkClick = () => {
    if (!session?.user?.id) return openSignIn();
    return handleFork();
  };

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b min-h-[3rem] overflow-x-auto overflow-y-hidden">
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
        <div className="flex items-center gap-4 ">
          <div className="flex gap-2 text-sm text-muted-foreground ">
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger
                  className="hover:bg-muted/50 p-2 rounded-md transition-colors border-white/20 border"
                  onClick={handleForkClick}
                  disabled={loading}
                >
                  <FaCodeBranch className="h-4 w-4 transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="bottom">Fork this Query</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/*   @TODO: Add "Star this Query" tooltip here once like count logic is available.
  This component already exists in /explore, but bringing it here means we also need to fetch and show like counts for proper UX.
  No need to put it here if it's half baked — users need feedback if they’re gonna star something. */}
          </div>

          <ExecuteButton
            handleExecute={handleExecuteQuery}
            isExecuting={isExecuting}
            executionType={executionType}
            setExecutionType={handleSetExecutionType}
            cancelQuery={cancelQueryExecution}
          />
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
        tabId={tabId}
      />
    </div>
  );
};
