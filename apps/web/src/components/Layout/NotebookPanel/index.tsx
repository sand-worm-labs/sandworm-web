"use client";

import { useState } from "react";
import { GitBranch, Clock } from "lucide-react";
import { cn } from "@sandworm/ui/lib/utils";

import { SparkleAI } from "@/components/Assets/SparkleAI";
import { Dashboard } from "@/components/Assets/Dashboard";
import { Notebook } from "@/components/Assets/Notebook";

// =====================================
// Types
// =====================================
type PanelAction = {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick?: () => void;
};

type PanelSection = {
  id: string;
  items: PanelAction[];
};

// =====================================
// Panel Item Component
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
    <button
      type="button"
      onClick={onClick ?? action.onClick}
      className={cn(
        "p-2 rounded-lg transition-colors flex items-center justify-center",
        "text-[#6C757D] hover:text-[#1A1A1A] dark:text-[#868E96] dark:hover:text-white",
        "hover:bg-[#F1F3F4] dark:hover:bg-[#21262d]",
        isActive &&
        "bg-[#F1F3F4] dark:bg-[#21262d] text-[#1A1A1A] dark:text-white"
      )}
      aria-label={action.label}
      title={action.label}
    >
      <Icon size={18} />
    </button>
  );
};

// =====================================
// Panel Section Divider
// =====================================
const PanelDivider = () => (
  <div className="w-full px-2">
    <div className="h-px bg-[#E3E5E8] dark:bg-[#262A30]" />
  </div>
);

// =====================================
// AI Assistant Button (Special Styling)
// =====================================
const AIAssistantButton = ({ onClick }: { onClick?: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className=""
    aria-label="AI Assistant"
    title="AI Assistant"
  >
    <SparkleAI />
  </button>
);

// =====================================
// Props
// =====================================
interface NotebookPanelProps {
  sidebarContent?: React.ReactNode;
  onToggleChat?: () => void;
}

// =====================================
// Notebook Panel Component
// =====================================
export const NotebookPanel = ({
  sidebarContent,
  onToggleChat,
}: NotebookPanelProps) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  // Panel configuration - easily extensible
  const panelSections: PanelSection[] = [
    {
      id: "view",
      items: [
        {
          id: "grid-view",
          icon: Dashboard,
          label: "Grid View",
        },
        {
          id: "list-view",
          icon: Notebook,
          label: "List View",
        },
      ],
    },
  ];

  const bottomActions: PanelAction[] = [];

  const handleItemClick = (itemId: string) => {
    setActiveItem(prev => (prev === itemId ? null : itemId));
  };

  return (
    <aside
      className={cn(
        "flex flex-col items-center py-4 px-2 h-[95%]",
        "bg-white dark:bg-[#0C1015]",
        "border-l border-[#E3E5E8] dark:border-[#262A30]",
        "w-14"
      )}
    >
      {/* Top Section */}
      <div className="flex flex-col items-center gap-1">
        {panelSections.map((section, sectionIndex) => (
          <div key={section.id} className="flex flex-col items-center gap-1">
            {section.items.map(item => (
              <PanelItem
                key={item.id}
                action={item}
                isActive={activeItem === item.id}
                onClick={() => handleItemClick(item.id)}
              />
            ))}
            {sectionIndex < panelSections.length - 1 && (
              <div className="py-2">
                <PanelDivider />
              </div>
            )}
          </div>
        ))}

        {/* Sidebar Content (EllipsisDropdown) */}
        {sidebarContent && (
          <>
            <div className="py-2">
              <PanelDivider />
            </div>
            {sidebarContent}
          </>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom Section */}
      <div className="flex flex-col items-center gap-1">
        {bottomActions.map(action => (
          <PanelItem
            key={action.id}
            action={action}
            isActive={activeItem === action.id}
            onClick={() => handleItemClick(action.id)}
          />
        ))}

        {/* AI Assistant Button */}
        <div className="pt-2">
          <AIAssistantButton onClick={onToggleChat} />
        </div>
      </div>
    </aside>
  );
};

export default NotebookPanel;
