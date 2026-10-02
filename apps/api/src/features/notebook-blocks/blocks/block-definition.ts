import type * as Y from 'yjs';
import type { BlockType, YBlock } from '@sandworm/editor';
import type { BlockSpec } from '../../collaboration/yjs/shared-doc/ai-blocks';

export const BLOCK_KINDS = [
  'sql',
  'python',
  'markdown',
  'rich_text',
  'visualization',
  'pivot_table',
  'input',
  'dropdown_input',
  'date_input',
  'power_toolbox',
] as const;

export type BlockKind = (typeof BLOCK_KINDS)[number];

export type BlockInput = {
  title?: string;
  source?: string;
  dataSource?: string;
  dataframeName?: string;
  toolId?: string;
  inputs?: Record<string, string | number | boolean | string[]>;
};

export type BlockSummary = {
  id: string;
  kind: string;
  title: string;
} & Record<string, unknown>;

// What an update may change. Only the fields that were sent are present, so a
// definition can tell "leave it alone" from "set it to empty".
export type BlockPatch = Pick<BlockInput, 'title' | 'source' | 'dataSource' | 'dataframeName' | 'inputs'>;

// One entry per block kind the API can create. A new kind is a new file that
// implements this, plus a line in the registry.
export interface BlockDefinition {
  kind: BlockKind;
  type: BlockType;
  toSpec(input: BlockInput): BlockSpec;
  describe(block: YBlock, blocks: Y.Map<YBlock>): Record<string, unknown>;
  // Applies a patch in place. Fields the kind has no use for are rejected
  // rather than ignored, so a caller learns its edit did nothing.
  update(block: YBlock, blocks: Y.Map<YBlock>, patch: BlockPatch): void;
}
