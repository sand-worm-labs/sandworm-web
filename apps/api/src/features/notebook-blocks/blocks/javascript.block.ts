import { BlockType } from '@sandworm/editor';
import type { BlockDefinition } from './block-definition';
import { assertOnly, patchSourceText, patchTitle } from './update';

// Runs in the reader's browser, so only notebooks that run in the browser may
// have one: NotebookBlocksService refuses it for a cloud notebook.
export const javascriptBlock: BlockDefinition = {
  kind: 'javascript',
  type: BlockType.JavaScript,
  toSpec: ({ title, source }) => ({ type: BlockType.JavaScript, title, source }),
  describe: () => ({}),
  update(block, _blocks, patch) {
    assertOnly('javascript', patch, ['title', 'source']);
    patchTitle(block, patch);
    patchSourceText(block, patch);
  },
};
