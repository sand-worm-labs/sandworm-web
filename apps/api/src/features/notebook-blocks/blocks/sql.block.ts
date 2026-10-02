import { BadRequestException } from '@nestjs/common';
import { BlockType, getDataframes, getSQLAttributes, isSQLBlock, type SQLBlock, type YBlock } from '@sandworm/editor';
import type * as Y from 'yjs';
import { DATA_SOURCE_ID_BY_NAME, type DataSourceId } from '@sandworm/types';
import type { BlockDefinition } from './block-definition';
import { assertDataframeName, assertOnly, patchSourceText, patchTitle } from './update';

function dataSourceIdFor(dataSource: string): DataSourceId {
  const dataSourceId = DATA_SOURCE_ID_BY_NAME[dataSource];
  if (!dataSourceId) {
    const known = Object.keys(DATA_SOURCE_ID_BY_NAME).join(', ');
    throw new BadRequestException(`Unknown data source "${dataSource}". Use one of: ${known}`);
  }
  return dataSourceId;
}

// The result of a query lives in the kernel under the cell's dataframe name,
// so a rename leaves the old result behind: the cell goes back to "not run"
// and its entry in the notebook's dataframe list is dropped until it runs again.
function rename(block: Y.XmlElement<SQLBlock>, blocks: Y.Map<YBlock>, name: string): void {
  assertDataframeName(name);
  const { id, dataframeName } = getSQLAttributes(block, blocks);
  if (dataframeName.value === name) return;

  for (const other of blocks.values()) {
    if (other !== block && isSQLBlock(other) && getSQLAttributes(other, blocks).dataframeName.value === name) {
      throw new BadRequestException(`Another SQL cell already stores its result as "${name}"`);
    }
  }

  block.setAttribute('dataframeName', { value: name, newValue: name });
  block.setAttribute('result', null);
  if (block.doc) {
    const dataframes = getDataframes(block.doc);
    if (dataframes.get(dataframeName.value)?.blockId === id) dataframes.delete(dataframeName.value);
  }
}

export const sqlBlock: BlockDefinition = {
  kind: 'sql',
  type: BlockType.SQL,

  toSpec({ title, source, dataSource, dataframeName }) {
    const dataSourceId = dataSource ? dataSourceIdFor(dataSource) : undefined;
    return { type: BlockType.SQL, title, source, dataSourceId, dataframeName };
  },

  describe(block, blocks) {
    const attrs = getSQLAttributes(block as Y.XmlElement<SQLBlock>, blocks);
    return { dataframeName: attrs.dataframeName.value, dataSourceId: attrs.dataSourceId };
  },

  update(block, blocks, patch) {
    assertOnly('sql', patch, ['title', 'source', 'dataSource', 'dataframeName']);
    const sql = block as Y.XmlElement<SQLBlock>;
    // Resolved before anything is written, so a bad value changes nothing.
    const dataSourceId = patch.dataSource === undefined ? undefined : dataSourceIdFor(patch.dataSource);

    if (patch.dataframeName !== undefined) rename(sql, blocks, patch.dataframeName);
    patchTitle(block, patch);
    patchSourceText(block, patch);
    if (dataSourceId) {
      sql.setAttribute('dataSourceId', dataSourceId);
      sql.setAttribute('isFileDataSource', false);
    }
  },
};
