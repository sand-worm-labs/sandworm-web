import { DocumentEntity, UserWorkspaceRole } from '@sandworm/postgresql-typeorm';
import { WSSharedDoc } from '../interfaces';


export const WS_READY_STATE_CONNECTING = 0;
export const WS_READY_STATE_OPEN = 1;


export const MESSAGE_SYNC = 0;
export const MESSAGE_AWARENESS = 1;


export const PING_TIMEOUT = 30000;
export const PERSIST_DEBOUNCE_MS = 500;

export interface ClientMetadata {
    user: {
        id: string;
        email: string;
        username?: string;
    };
    role: UserWorkspaceRole;
    session: WSSharedDoc;
}

export interface RequestData {
    document: DocumentEntity;
    clock: number;
    authUser: any;
    role: UserWorkspaceRole;
    isApp: boolean;
    userId: string | null;
    workspaceId: string;
    appId?: string;
}