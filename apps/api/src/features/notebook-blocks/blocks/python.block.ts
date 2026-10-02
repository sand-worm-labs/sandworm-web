import { BlockType } from '@sandworm/editor';
import type { BlockDefinition } from './block-definition';
import { assertOnly, patchSourceText, patchTitle } from './update';

export const pythonBlock: BlockDefinition = {
  kind: 'python',
  type: BlockType.Python,
  toSpec: ({ title, source }) => ({ type: BlockType.Python, title, source }),
  describe: () => ({}),
  update(block, _blocks, patch) {
    assertOnly('python', patch, ['title', 'source']);
    patchTitle(block, patch);
    patchSourceText(block, patch);
  },
};
