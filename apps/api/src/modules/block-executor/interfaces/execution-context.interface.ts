export interface ExecutionContext {
    sessionId: string;
    workspaceId: string;
    documentId: string;
    userId: string;
  }
  
  export interface ExecutionMetadata {
    triggeredBy: 'user' | 'system' | 'dependency';
    triggeredAt: Date;
    retryCount?: number;
    parentBlockId?: string;
  }