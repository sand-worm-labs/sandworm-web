import { BlockType } from "@sandworm/editor";
import type { Block } from "@sandworm/editor";

// =====================================
// ⬢ Block Kind Extraction
// =====================================

export type BlockKind = Block["type"];

// =====================================
// ⬢ Reference Source Kinds
// Extend this union as new reference sources are added (dataframe, file, etc.)
// =====================================

export type ReferenceSourceKind = "block" | "dataframe" | "file";

// =====================================
// ⬢ Reference Items — one per source kind
// =====================================

export interface BlockReferenceItem {
  sourceKind: "block";
  id: string;
  blockKind: BlockKind;
  /** Display label — e.g. "SQL Block 3" or user-defined title */
  label: string;
  /** Short content preview shown in the picker list */
  preview?: string;
  /** 1-based notebook position */
  index: number;
}

export interface DataframeReferenceItem {
  sourceKind: "dataframe";
  id: string;
  label: string;
  /** e.g. "324 rows × 8 cols" */
  preview?: string;
}

export interface FileReferenceItem {
  sourceKind: "file";
  id: string;
  label: string;
  mimeType?: string;
  preview?: string;
}

export type ReferenceItem =
  | BlockReferenceItem
  | DataframeReferenceItem
  | FileReferenceItem;

// =====================================
// ⬢ Attached Reference
// The shape stored on the sent message
// =====================================

export interface AttachedReference {
  sourceKind: ReferenceSourceKind;
  id: string;
  label: string;
  blockKind?: BlockKind;
}

// =====================================
// ⬢ Reference Source
// Add new sources (dataframes, files) by appending to the sources array
// =====================================

export interface ReferenceSource {
  kind: ReferenceSourceKind;
  label: string;
  items: ReferenceItem[];
}

// =====================================
// ⬢ Block Kind Display Meta
// =====================================

export const BLOCK_KIND_META: Record<BlockKind, { label: string }> = {
  [BlockType.RichText]: { label: "Rich Text" },
  [BlockType.SQL]: { label: "SQL" },
  [BlockType.Python]: { label: "Python" },
  [BlockType.Input]: { label: "Input" },
  [BlockType.DropdownInput]: { label: "Dropdown" },
  [BlockType.DateInput]: { label: "Date Input" },
  [BlockType.FileUpload]: { label: "File Upload" },
  [BlockType.DashboardHeader]: { label: "Dashboard Header" },
  [BlockType.PivotTable]: { label: "Pivot Table" },
  [BlockType.VisualizationV2]: { label: "Visualization" },
  [BlockType.PowerToolbox]: { label: "Power Toolbox" },
  [BlockType.Markdown]: { label: "Markdown" },
};

// =====================================
// ⬢ Dummy Data  (replace with Yjs-derived block list)
// =====================================

export const DUMMY_BLOCKS: BlockReferenceItem[] = [
  {
    sourceKind: "block",
    id: "b1",
    blockKind: BlockType.SQL,
    index: 1,
    label: "SQL Block 1",
    preview: "SELECT address, balance FROM erc20_base...",
  },
  {
    sourceKind: "block",
    id: "b2",
    blockKind: BlockType.Python,
    index: 2,
    label: "Python Block 2",
    preview: "df = pd.DataFrame(query_result)",
  },
  {
    sourceKind: "block",
    id: "b3",
    blockKind: BlockType.VisualizationV2,
    index: 3,
    label: "Visualization 3",
    preview: "Bar chart — top 20 USDC holders",
  },
  {
    sourceKind: "block",
    id: "b4",
    blockKind: BlockType.SQL,
    index: 4,
    label: "SQL Block 4",
    preview: "SELECT token, SUM(amount) FROM transfers...",
  },
  {
    sourceKind: "block",
    id: "b5",
    blockKind: BlockType.Markdown,
    index: 5,
    label: "Markdown 5",
    preview: "## USDC Holder Analysis",
  },
  {
    sourceKind: "block",
    id: "b6",
    blockKind: BlockType.PivotTable,
    index: 6,
    label: "Pivot Table 6",
    preview: "Rows: address, Cols: date",
  },
  {
    sourceKind: "block",
    id: "b7",
    blockKind: BlockType.Python,
    index: 7,
    label: "Python Block 7",
    preview: "fig = px.bar(df, x='address', y='balance')",
  },
];
// =====================================
// ⬢ Types
// =====================================

export interface ThreadItem {
  id: string;
  title: string;
  updatedAt: Date;
  isPinned: boolean;
}

export type ThreadGroup = "pinned" | "today" | "yesterday" | "earlier";

// =====================================
// ⬢ Constants
// =====================================

export const MAX_PINNED = 3;

// =====================================
// ⬢ Grouping Helpers
// =====================================

export function getThreadGroup(date: Date): Exclude<ThreadGroup, "pinned"> {
  const now = new Date();
  if (
    now.getDate() === date.getDate() &&
    now.getMonth() === date.getMonth() &&
    now.getFullYear() === date.getFullYear()
  ) {
    return "today";
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    yesterday.getDate() === date.getDate() &&
    yesterday.getMonth() === date.getMonth() &&
    yesterday.getFullYear() === date.getFullYear()
  ) {
    return "yesterday";
  }
  return "earlier";
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// =====================================
// ⬢ Dummy Data
// Notebook context: "Bot Wallet Clustering on Base"
// These are real things an analyst would chat about in this notebook
// =====================================

const now = new Date();
const minsAgo = (m: number) => new Date(now.getTime() - m * 60000);
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000);
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);

export const DUMMY_THREADS: ThreadItem[] = [
  {
    id: "t1",
    title: "Rename notebook and update intro",
    updatedAt: minsAgo(12),
    isPinned: true,
  },
  {
    id: "t2",
    title: "Refine HDBSCAN clustering parameters",
    updatedAt: hoursAgo(1),
    isPinned: true,
  },
  {
    id: "t3",
    title: "Fix wallet dedup logic in SQL block",
    updatedAt: hoursAgo(3),
    isPinned: false,
  },
  {
    id: "t4",
    title: "Add bot score column to output dataframe",
    updatedAt: hoursAgo(5),
    isPinned: false,
  },
  {
    id: "t5",
    title: "Rewrite the analysis summary section",
    updatedAt: daysAgo(1),
    isPinned: false,
  },
  {
    id: "t6",
    title: "Visualise cluster distribution as bar chart",
    updatedAt: daysAgo(1),
    isPinned: false,
  },
  {
    id: "t7",
    title: "Why are some wallets in multiple clusters",
    updatedAt: daysAgo(2),
    isPinned: false,
  },
  {
    id: "t8",
    title: "Add method notes to the rich text block",
    updatedAt: daysAgo(3),
    isPinned: false,
  },
  {
    id: "t9",
    title: "Optimise the transfer join query",
    updatedAt: daysAgo(5),
    isPinned: false,
  },
  {
    id: "t10",
    title: "Draft findings paragraph for sharing",
    updatedAt: daysAgo(6),
    isPinned: false,
  },
];
