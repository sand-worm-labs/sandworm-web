import { DocumentEntity, UserWorkspaceRole } from '@sandworm/postgresql-typeorm';

export interface RequestData {
    document: DocumentEntity;
    clock: number;
    authUser: any;
    role: UserWorkspaceRole;
    isApp: boolean;
    userId: string | null;
}