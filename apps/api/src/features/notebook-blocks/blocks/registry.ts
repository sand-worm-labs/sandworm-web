import type * as Y from 'yjs';
import type { YBlock } from '@sandworm/editor';
import type { BlockDefinition, BlockKind, BlockSummary } from './block-definition';
import { markdownBlock } from './markdown.block';
import { pythonBlock } from './python.block';
import { sqlBlock } from './sql.block';

const DEFINITIONS: BlockDefinition[] = [sqlBlock, pythonBlock, markdownBlock];

const byKind = new Map<BlockKind, BlockDefinition>(DEFINITIONS.map(d => [d.kind, d]));
const byType = new Map<string, BlockDefinition>(DEFINITIONS.map(d => [d.type, d]));

export const getDefinition = (kind: BlockKind): BlockDefinition => {
  const definition = byKind.get(kind);
  if (!definition) throw new Error(`No block definition for kind "${kind}"`);
  return definition;
};

// Blocks of a type with no definition (inputs, pivot tables, ...) still
// summarize, just without kind-specific fields.
export function summarizeBlock(block: YBlock, blocks: Y.Map<YBlock>): BlockSummary {
  const type = String(block.getAttribute('type'));
  const definition = byType.get(type);
  return {
    id: String(block.getAttribute('id')),
    kind: definition?.kind ?? type.toLowerCase(),
    title: String(block.getAttribute('title') ?? ''),
    ...definition?.describe(block, blocks),
  };
}
