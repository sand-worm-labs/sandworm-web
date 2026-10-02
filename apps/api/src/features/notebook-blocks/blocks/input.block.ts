import { BlockType } from '@sandworm/editor';
import type { BlockDefinition } from './block-definition';

// For the three input kinds, `title` is the visible label and `source` the
// default value (dropdown: one option per line; date: YYYY/MM/DD).
export const inputBlock: BlockDefinition = {
  kind: 'input',
  type: BlockType.Input,
  toSpec: ({ title, source }) => ({ type: BlockType.Input, title, source }),
  describe: () => ({}),
};

export const dropdownInputBlock: BlockDefinition = {
  kind: 'dropdown_input',
  type: BlockType.DropdownInput,
  toSpec: ({ title, source }) => ({ type: BlockType.DropdownInput, title, source }),
  describe: () => ({}),
};

export const dateInputBlock: BlockDefinition = {
  kind: 'date_input',
  type: BlockType.DateInput,
  toSpec: ({ title, source }) => ({ type: BlockType.DateInput, title, source }),
  describe: () => ({}),
};
