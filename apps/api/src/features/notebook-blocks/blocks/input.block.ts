import { BadRequestException } from '@nestjs/common';
import {
  appendDropdownInputOptions,
  BlockType,
  dateInputValueFromString,
  formatDateInputValue,
  getDropdownInputAttributes,
  updateDropdownInputLabel,
  updateDropdownInputValue,
  updateInputLabel,
  updateInputValue,
  updateYText,
  type DateInputBlock,
  type DropdownInputBlock,
  type InputBlock,
} from '@sandworm/editor';
import * as Y from 'yjs';
import type { BlockDefinition } from './block-definition';
import { assertOnly } from './update';

// For the three input kinds, `title` is the visible label and `source` the
// default value (dropdown: one option per line; date: YYYY/MM/DD). A changed
// value reaches the kernel the next time the cell runs.
export const inputBlock: BlockDefinition = {
  kind: 'input',
  type: BlockType.Input,
  toSpec: ({ title, source }) => ({ type: BlockType.Input, title, source }),
  describe: () => ({}),
  update(block, _blocks, patch) {
    assertOnly('input', patch, ['title', 'source']);
    const input = block as Y.XmlElement<InputBlock>;
    if (patch.title !== undefined) updateInputLabel(input, patch.title);
    if (patch.source !== undefined) {
      const value = patch.source.trim();
      updateInputValue(input, { value, newValue: value });
    }
  },
};

export const dropdownInputBlock: BlockDefinition = {
  kind: 'dropdown_input',
  type: BlockType.DropdownInput,
  toSpec: ({ title, source }) => ({ type: BlockType.DropdownInput, title, source }),
  describe: () => ({}),
  update(block, blocks, patch) {
    assertOnly('dropdown_input', patch, ['title', 'source']);
    const dropdown = block as Y.XmlElement<DropdownInputBlock>;
    // Checked before anything is written, so a bad value changes nothing.
    const options = patch.source?.split('\n').map(option => option.trim()).filter(Boolean);
    if (options?.length === 0) throw new BadRequestException('A dropdown needs at least one option, one per line');

    if (patch.title !== undefined) updateDropdownInputLabel(dropdown, patch.title);
    if (options) {
      appendDropdownInputOptions(dropdown, blocks, options, true);
      // Keep the selection when it is still on offer, otherwise fall back to the first option.
      const { value } = getDropdownInputAttributes(dropdown, blocks);
      if (value.newValue === null || !options.includes(value.newValue)) {
        updateDropdownInputValue(dropdown, { newValue: options[0], error: null });
      }
    }
  },
};

const DATE = /^\d{4}\/\d{2}\/\d{2}/;

export const dateInputBlock: BlockDefinition = {
  kind: 'date_input',
  type: BlockType.DateInput,
  toSpec: ({ title, source }) => ({ type: BlockType.DateInput, title, source }),
  describe: () => ({}),
  update(block, _blocks, patch) {
    assertOnly('date_input', patch, ['title', 'source']);
    const date = block as Y.XmlElement<DateInputBlock>;
    const text = patch.source?.trim();
    if (text !== undefined && !DATE.test(text)) throw new BadRequestException(`"${text}" is not a date: use YYYY/MM/DD`);

    if (patch.title !== undefined) {
      const label = date.getAttribute('label');
      if (label) updateYText(label, patch.title);
    }
    if (text !== undefined) {
      const dateType = date.getAttribute('dateType') ?? 'date';
      const parsed = dateInputValueFromString(text, date.getAttribute('value')!);
      date.setAttribute('value', parsed);
      date.setAttribute('newValue', new Y.Text(formatDateInputValue(parsed, dateType)));
    }
  },
};
