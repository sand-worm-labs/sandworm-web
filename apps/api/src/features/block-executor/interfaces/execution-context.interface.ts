// apps/api/src/modules/block-executor/interfaces/execution-context.interface.ts
import * as Y from 'yjs';
import { DataFrame } from '@sandworm/types';
import { YBlock } from "@sandworm/editor"

export interface ExecutionContext {
  sessionId: string;
  workspaceId: string;
  documentId: string;
}

export interface DocumentContext {
  blocks: Y.Map<YBlock>;
  dataframes: Y.Map<DataFrame>;
  execution: ExecutionContext;
}

export interface ExecutionMetadata {
  triggeredBy: 'user' | 'system' | 'dependency';
  triggeredAt: Date;
  retryCount?: number;
  parentBlockId?: string;
}