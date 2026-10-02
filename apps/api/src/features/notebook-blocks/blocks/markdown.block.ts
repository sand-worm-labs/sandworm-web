import { BlockType } from '@sandworm/editor';
import type { BlockDefinition } from './block-definition';
import { assertOnly, patchSourceText, patchTitle } from './update';

export const markdownBlock: BlockDefinition = {
  kind: 'markdown',
  type: BlockType.Markdown,
  toSpec: ({ title, source }) => ({ type: BlockType.Markdown, title, source }),
  describe: () => ({}),
  update(block, _blocks, patch) {
    assertOnly('markdown', patch, ['title', 'source']);
    patchTitle(block, patch);
    patchSourceText(block, patch);
  },
};
