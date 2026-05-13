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
