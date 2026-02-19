export interface WSSharedDoc {
    id: string;
    documentId: string;
    appId: string ;
    isApp: boolean;
    userId: string;
    persistTimeout?: NodeJS.Timeout;
    lastPersist: number;
    workspaceId: string;
    ydoc: import('yjs').Doc;
    awareness: import('y-protocols/awareness').Awareness;
    conns: Map<import('ws').WebSocket, Set<number>>;
    clock: number;
    blocks: import('yjs').Map<any>;
    layout: import('yjs').Array<any>;
    dataframes: import('yjs').Map<any>;
    dashboard: import('yjs').Map<any>;
    getByteLength(): number;
    canCollect(): boolean;
}