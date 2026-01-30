// yjs.types.ts
import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness';
import { WebSocket } from 'ws';
import { DocumentEntity, UserWorkspaceRole } from '@sandworm/postgresql-typeorm';


export const WS_READY_STATE_CONNECTING = 0;
export const WS_READY_STATE_OPEN = 1;


export const MESSAGE_SYNC = 0;
export const MESSAGE_AWARENESS = 1;


export const PING_TIMEOUT = 30000;
export const PERSIST_DEBOUNCE_MS = 500;

// Interfaces
export interface DocumentSession {
    documentId: string;
    workspaceId: string;
    yDoc: Y.Doc;
    awareness: awarenessProtocol.Awareness;
    conns: Map<WebSocket, Set<number>>;
    clock: number;
    isApp: boolean;
    userId: string | null;
    persistTimeout?: NodeJS.Timeout;
    lastPersist: number;
}

export interface ClientMetadata {
    user: {
        id: string;
        email: string;
        username?: string;
    };
    role: UserWorkspaceRole;
    session: DocumentSession;
}

export interface RequestData {
    document: DocumentEntity;
    clock: number;
    authUser: any;
    role: UserWorkspaceRole;
    isApp: boolean;
    userId: string | null;
}