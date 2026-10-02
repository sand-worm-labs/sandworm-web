import { BlockType } from '@sandworm/editor';
import type { BlockDefinition } from './block-definition';

export const markdownBlock: BlockDefinition = {
  kind: 'markdown',
  type: BlockType.Markdown,
  toSpec: ({ title, source }) => ({ type: BlockType.Markdown, title, source }),
  describe: () => ({}),
};
