import { BadRequestException } from '@nestjs/common';
import { BlockType, getSQLAttributes, type SQLBlock } from '@sandworm/editor';
import type * as Y from 'yjs';
import { DATA_SOURCE_ID_BY_NAME } from '@sandworm/types';
import type { BlockDefinition } from './block-definition';

export const sqlBlock: BlockDefinition = {
  kind: 'sql',
  type: BlockType.SQL,

  toSpec({ title, source, dataSource, dataframeName }) {
    const dataSourceId = dataSource ? DATA_SOURCE_ID_BY_NAME[dataSource] : undefined;
    if (dataSource && !dataSourceId) {
      const known = Object.keys(DATA_SOURCE_ID_BY_NAME).join(', ');
      throw new BadRequestException(`Unknown data source "${dataSource}". Use one of: ${known}`);
    }
    return { type: BlockType.SQL, title, source, dataSourceId, dataframeName };
  },

  describe(block, blocks) {
    const attrs = getSQLAttributes(block as Y.XmlElement<SQLBlock>, blocks);
    return { dataframeName: attrs.dataframeName.value, dataSourceId: attrs.dataSourceId };
  },
};
