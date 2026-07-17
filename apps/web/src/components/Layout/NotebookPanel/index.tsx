"use client";

import { cn } from "@sandworm/ui/lib/utils";

import { SparkleAI } from "@/components/Assets/SparkleAI";
import useSideBar from "@/components/Editor/hooks/useSideBar";
import { TooltipV2 } from "@/components/Editor/blocks/ToolTips";

// =====================================
// ⬢ Types
// =====================================
type PanelAction = {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick?: () => void;
};

// =====================================
// ⬢ Panel Item Component
// =====================================
const PanelItem = ({
  action,
  isActive,
  onClick,
}: {
  action: PanelAction;
  isActive?: boolean;
  onClick?: () => void;
}) => {
  const Icon = action.icon;

  return (
    <TooltipV2 active title={action.label} position="left">
      {ref => (
        <button
          ref={ref as React.RefObject<HTMLButtonElement>}
          type="button"
          onClick={onClick ?? action.onClick}
          className={cn(
            "p-2 rounded-lg transition-colors flex items-center justify-center",
            "text-ink-400 hover:text-ink-100 dark:text-ink-300 dark:hover:text-white",
            "hover:bg-base-300 dark:hover:bg-editor-500",
            isActive &&
              "bg-base-300 dark:bg-base-500 text-ink-100 dark:text-white"
          )}
          aria-label={action.label}
        >
          <Icon size={22} />
        </button>
      )}
    </TooltipV2>
  );
};

// =====================================
// ⬢ AI Assistant Button
// =====================================
const AIAssistantButton = ({ onClick }: { onClick?: () => void }) => (
  <TooltipV2 active title="AI Assistant" position="left">
    {ref => (
      <button
        ref={ref as React.RefObject<HTMLButtonElement>}
        type="button"
        onClick={onClick}
        className="border-t border-b border-border-secondary dark:border-border-tertiary py-3.5 w-full flex items-center justify-center"
        aria-label="AI Assistant"
      >
        <SparkleAI size={36} />
      </button>
    )}
  </TooltipV2>
);

// =====================================
// ⬢ Props
// =====================================
interface NotebookPanelProps {
  sidebarContent?: React.ReactNode;
  onToggleChat?: () => void;
}

// =====================================
// ⬢ Notebook Panel Component
// =====================================
export const NotebookPanel = ({
  sidebarContent,
  onToggleChat,
}: NotebookPanelProps) => {
  const {
    state: { rightPanelId },
    api,
  } = useSideBar();

  const bottomActions: PanelAction[] = [];

  const handleItemClick = (itemId: string) => {
    if (rightPanelId === itemId) {
      api.closeRightPanel();
    } else {
      api.openRightPanel(itemId);
    }
  };

  return (
    <aside
      className={cn(
        "flex flex-col items-center py-4 pb-0 px-0 h-[100%]",
        "bg-white dark:bg-base-500",
        "border-l border-border-quiet dark:border-border-tertiary",
        "w-[56px] z-[50] print:hidden"
      )}
    >
      <div className="flex flex-col items-center gap-x-0 w-full">
        {sidebarContent && (
          <>
            <div className="py-2 pt-0 w-full" />
            {sidebarContent}
          </>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex flex-col items-center justify-center gap-1 w-full">
        {bottomActions.map(action => (
          <PanelItem
            key={action.id}
            action={action}
            isActive={rightPanelId === action.id}
            onClick={() => handleItemClick(action.id)}
          />
        ))}

        <div className="pt-2 w-full">
          <AIAssistantButton onClick={onToggleChat} />
        </div>
      </div>
    </aside>
  );
};

export default NotebookPanel;
