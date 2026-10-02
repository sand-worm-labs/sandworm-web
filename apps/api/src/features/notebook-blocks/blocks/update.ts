import { BadRequestException } from '@nestjs/common';
import { setTitle, updateYText, type YBlock } from '@sandworm/editor';
import type * as Y from 'yjs';
import type { BlockKind, BlockPatch } from './block-definition';

type Field = keyof BlockPatch;

const FIELD_NAMES: Record<Field, string> = {
  title: 'title',
  source: 'source',
  dataSource: 'dataSource',
  dataframeName: 'dataframeName',
  inputs: 'inputs',
};

// Rejects every field of the patch that this kind cannot take.
export function assertOnly(kind: BlockKind, patch: BlockPatch, allowed: Field[]): void {
  const rejected = (Object.keys(patch) as Field[]).filter(field => patch[field] !== undefined && !allowed.includes(field));
  if (rejected.length) {
    throw new BadRequestException(
      `${kind} cells have no ${rejected.map(field => FIELD_NAMES[field]).join(' or ')} to change. They accept: ${allowed.map(field => FIELD_NAMES[field]).join(', ')}`,
    );
  }
}

export function patchTitle(block: YBlock, { title }: BlockPatch): void {
  if (title !== undefined) setTitle(block, title);
}

// Rewrites the cell's text as a diff against what is there, so someone typing
// in the same cell keeps their cursor and their concurrent edits.
export function patchSourceText(block: YBlock, { source }: BlockPatch): void {
  if (source === undefined) return;
  const text = (block as Y.XmlElement<{ source: Y.Text }>).getAttribute('source');
  if (!text) throw new BadRequestException('This cell has no text to replace');
  updateYText(text, source);
}

// What a dataframe may be called: it becomes a Python variable in the kernel.
const DATAFRAME_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function assertDataframeName(name: string): void {
  if (!DATAFRAME_NAME.test(name)) {
    throw new BadRequestException(`"${name}" is not a valid dataframe name: use letters, digits and underscores, not starting with a digit`);
  }
}
