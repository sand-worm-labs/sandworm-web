import { BlockType, type PivotTableBlock } from '@sandworm/editor';
import type * as Y from 'yjs';
import type { BlockDefinition } from './block-definition';
import { assertDataframeName, assertOnly, patchTitle } from './update';

// Binds a pivot table to a dataframe; rows, columns and metrics are picked in
// the editor, since they need the dataframe's column metadata.
export const pivotTableBlock: BlockDefinition = {
  kind: 'pivot_table',
  type: BlockType.PivotTable,
  toSpec: ({ title, dataframeName }) => ({ type: BlockType.PivotTable, title, dataframeName }),
  describe: () => ({}),
  update(block, _blocks, patch) {
    assertOnly('pivot_table', patch, ['title', 'dataframeName']);
    patchTitle(block, patch);
    if (patch.dataframeName !== undefined) {
      assertDataframeName(patch.dataframeName);
      (block as Y.XmlElement<PivotTableBlock>).setAttribute('dataframeName', patch.dataframeName);
    }
  },
};
