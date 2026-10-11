import {
  Coins,
  Layers,
  Link2,
  LayoutDashboard,
  NotebookText,
  Shapes,
  User2Icon,
  type LucideIcon,
} from "lucide-react";

import type { SearchEntryType } from "@/lib/search/types";

// How each kind of result is named and drawn. The order is the order the palette shows
// them in, and matches the order the API returns them.
export const CATEGORIES: {
  id: SearchEntryType;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "protocol", label: "Protocols", icon: Layers },
  { id: "chain", label: "Chains", icon: Link2 },
  { id: "category", label: "Categories", icon: Shapes },
  { id: "notebook", label: "Notebooks", icon: NotebookText },
  { id: "dashboard", label: "Dashboards", icon: LayoutDashboard },
  { id: "creator", label: "Creators", icon: User2Icon },
  { id: "bounty", label: "Bounties", icon: Coins },
];
