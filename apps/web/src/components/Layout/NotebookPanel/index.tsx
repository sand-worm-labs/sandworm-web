"use client";

import { useState } from "react";
import {
  Sun,
  Grid2X2,
  List,
  MoreHorizontal,
  GitBranch,
  Clock,
  Sparkles,
} from "lucide-react";
import { cn } from "@sandworm/ui/lib/utils";

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
      <Icon size={20} />
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
    className={cn(
      "p-2.5 rounded-xl transition-all flex items-center justify-center",
      "bg-gradient-to-br from-[#A308F0]/10 via-[#005DE7]/10 to-[#00D4AA]/10",
      "border border-[#A308F0]/30 dark:border-[#A308F0]/40",
      "hover:from-[#A308F0]/20 hover:via-[#005DE7]/20 hover:to-[#00D4AA]/20",
      "hover:border-[#A308F0]/50 hover:shadow-lg hover:shadow-[#A308F0]/10",
      "group"
    )}
    aria-label="AI Assistant"
    title="AI Assistant"
  >
    <Sparkles
      size={20}
      className="text-[#A308F0] group-hover:scale-110 transition-transform"
    />
  </button>
);

// =====================================
// Notebook Panel Component
// =====================================
export const NotebookPanel = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  // Panel configuration - easily extensible
  const panelSections: PanelSection[] = [
    {
      id: "view",
      items: [
        {
          id: "grid-view",
          icon: Grid2X2,
          label: "Grid View",
        },
        {
          id: "list-view",
          icon: List,
          label: "List View",
        },
      ],
    },
    {
      id: "actions",
      items: [
        {
          id: "more-options",
          icon: MoreHorizontal,
          label: "More Options",
        },
      ],
    },
  ];

  const bottomActions: PanelAction[] = [
    {
      id: "version-control",
      icon: GitBranch,
      label: "Version Control",
    },
    {
      id: "history",
      icon: Clock,
      label: "History",
    },
  ];

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
          <AIAssistantButton onClick={() => handleItemClick("ai-assistant")} />
        </div>
      </div>
    </aside>
  );
};

export default NotebookPanel;
