import { DataSourceId } from '@sandworm/types';

export type BlockActionType = 'generating' | 'created' | 'edited' | 'ran' | 'deleted';

export class BlockActionEvent {
  chatId: string;
  blockId?: string;
  blockType: string;
  blockTitle: string;
  action: BlockActionType;
  content?: string;
  dataSourceId?: DataSourceId | null;
  dataframeName?: string | null;
}

export const BlockActionEventNames = {
  BLOCK_ACTION: 'block.action',
} as const;
