export interface LoadStateResult {
  ydoc: import('yjs').Doc;
  clock: number;
  byteLength: number;
  applyUpdateLatency: number;
  clockUpdatedAt: Date;
}

export interface ReplaceStateResult extends LoadStateResult {
  replaced: boolean;
}
