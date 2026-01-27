import { Document } from "@/features/document/model/document.model";

export class WorkspaceDocumentsEvent {
    workspaceId: string;
    documents: Document[];
};

export class DocumentUpdateEvent {
    workspaceId: string;
    document: Document;
};

export const EventNames = {
    WORKSPACE_DOCUMENTS: 'workspace-documents',
    DOCUMENT_UPDATE: 'workspace-document-update',
} as const;
