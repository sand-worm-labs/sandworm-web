import { Document } from "@/features/document/model/document.model";

export class WorkspaceDocumentsEvent {
    workspaceId: string;
    documents: Document[];

    constructor(workspaceId: string, documents: Document[]) {
        this.workspaceId = workspaceId;
        this.documents = documents;
    }
}

export class DocumentUpdateEvent {
    workspaceId: string;
    document: Document;

    constructor(workspaceId: string, document: Document) {
        this.workspaceId = workspaceId;
        this.document = document;
    }
}

export const EventNames = {
    WORKSPACE_DOCUMENTS: 'workspace-documents',
    DOCUMENT_UPDATE: 'workspace-document-update',
} as const;