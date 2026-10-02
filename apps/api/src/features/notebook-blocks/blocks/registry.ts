import type * as Y from 'yjs';
import type { YBlock } from '@sandworm/editor';
import type { BlockDefinition, BlockKind, BlockSummary } from './block-definition';
import { dateInputBlock, dropdownInputBlock, inputBlock } from './input.block';
import { markdownBlock } from './markdown.block';
import { pivotTableBlock } from './pivot-table.block';
import { powerToolboxBlock } from './power-toolbox.block';
import { pythonBlock } from './python.block';
import { richTextBlock } from './rich-text.block';
import { sqlBlock } from './sql.block';
import { visualizationBlock } from './visualization.block';

const DEFINITIONS: BlockDefinition[] = [
  sqlBlock,
  pythonBlock,
  markdownBlock,
  richTextBlock,
  visualizationBlock,
  pivotTableBlock,
  inputBlock,
  dropdownInputBlock,
  dateInputBlock,
  powerToolboxBlock,
];

const byKind = new Map<BlockKind, BlockDefinition>(DEFINITIONS.map(d => [d.kind, d]));
const byType = new Map<string, BlockDefinition>(DEFINITIONS.map(d => [d.type, d]));

export const getDefinition = (kind: BlockKind): BlockDefinition => {
  const definition = byKind.get(kind);
  if (!definition) throw new Error(`No block definition for kind "${kind}"`);
  return definition;
};

// The definition for an existing block, or undefined for a type the API does
// not create (file uploads, dashboard headers).
export const getDefinitionFor = (block: YBlock): BlockDefinition | undefined => byType.get(String(block.getAttribute('type')));

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
