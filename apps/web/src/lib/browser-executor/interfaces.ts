import type * as Y from "yjs";
import type { YBlock } from "@sandworm/editor";
import type { DataFrame } from "@sandworm/types";

// Mirrors apps/api's DocumentContext; the notebook id names its Python globals.
export interface DocumentContext {
  notebookId: string;
  blocks: Y.Map<YBlock>;
  dataframes: Y.Map<DataFrame>;
}

export const VARIABLE_NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
