export type BlockActionType = 'created' | 'edited' | 'ran' | 'deleted';

export class BlockActionEvent {
  workspaceId: string;
  documentId: string;
  chatId?: string;
  blockId: string;
  blockType: string;
  blockTitle: string;
  action: BlockActionType;
}

export const BlockActionEventNames = {
  BLOCK_ACTION: 'block.action',
} as const;
