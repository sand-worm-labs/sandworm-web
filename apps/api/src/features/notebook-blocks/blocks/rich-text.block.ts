import { BlockType } from '@sandworm/editor';
import type { BlockDefinition } from './block-definition';

export const richTextBlock: BlockDefinition = {
  kind: 'rich_text',
  type: BlockType.RichText,
  toSpec: ({ title, source }) => ({ type: BlockType.RichText, title, source }),
  describe: () => ({}),
};
