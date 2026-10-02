import { BlockType } from '@sandworm/editor';
import type { BlockDefinition } from './block-definition';

export const pythonBlock: BlockDefinition = {
  kind: 'python',
  type: BlockType.Python,
  toSpec: ({ title, source }) => ({ type: BlockType.Python, title, source }),
  describe: () => ({}),
};
