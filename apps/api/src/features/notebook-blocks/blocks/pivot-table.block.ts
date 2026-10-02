import { BlockType } from '@sandworm/editor';
import type { BlockDefinition } from './block-definition';

// Binds a pivot table to a dataframe; rows, columns and metrics are picked in
// the editor, since they need the dataframe's column metadata.
export const pivotTableBlock: BlockDefinition = {
  kind: 'pivot_table',
  type: BlockType.PivotTable,
  toSpec: ({ title, dataframeName }) => ({ type: BlockType.PivotTable, title, dataframeName }),
  describe: () => ({}),
};
