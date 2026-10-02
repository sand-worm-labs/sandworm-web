import type * as Y from 'yjs';
import type { BlockType, YBlock } from '@sandworm/editor';
import type { BlockSpec } from '../../collaboration/yjs/shared-doc/ai-blocks';

export const BLOCK_KINDS = ['sql', 'python', 'markdown'] as const;

export type BlockKind = (typeof BLOCK_KINDS)[number];

export type BlockInput = {
  title?: string;
  source?: string;
  dataSource?: string;
  dataframeName?: string;
};

export type BlockSummary = {
  id: string;
  kind: string;
  title: string;
} & Record<string, unknown>;

// One entry per block kind the API can create. A new kind is a new file that
// implements this, plus a line in the registry.
export interface BlockDefinition {
  kind: BlockKind;
  type: BlockType;
  // Validates the kind-specific parts of the input and maps it onto the spec
  // the Yjs writer understands.
  toSpec(input: BlockInput): BlockSpec;
  // Kind-specific fields to expose alongside the common id, kind and title.
  describe(block: YBlock, blocks: Y.Map<YBlock>): Record<string, unknown>;
}
