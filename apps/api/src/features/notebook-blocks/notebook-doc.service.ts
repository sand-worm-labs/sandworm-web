import { Injectable } from '@nestjs/common';
import { DocumentService } from '../document/service/document.service';
import { PersistorFactory } from '../collaboration/yjs/persistors/persistor.factory';
import type { SharedDoc } from '../collaboration/yjs/shared-doc/ws-shared-doc';
import { YjsDocumentService } from '../collaboration/yjs/yjs-document.service';
import { WorkspaceMembershipService } from '../workspace/service/workspace-membership.service';

export type NotebookRef = { userId: string; workspaceId: string; documentId: string };

// 'member' is anyone active in the workspace; 'editor' excludes viewers.
export type NotebookAccess = 'member' | 'editor';

@Injectable()
export class NotebookDocService {
  constructor(
    private readonly yjsDocumentService: YjsDocumentService,
    private readonly persistorFactory: PersistorFactory,
    private readonly documentService: DocumentService,
    private readonly membershipService: WorkspaceMembershipService,
  ) {}

  // Checks the caller may touch the notebook, then hands its live document to
  // `work`. The document stays loaded until `work` settles, however long that takes.
  async use<T>(
    { userId, workspaceId, documentId }: NotebookRef,
    access: NotebookAccess,
    work: (doc: SharedDoc) => T | Promise<T>,
  ): Promise<T> {
    if (access === 'editor') await this.membershipService.assertCanEdit(workspaceId, userId);
    else await this.membershipService.assertActiveMember(workspaceId, userId);
    await this.documentService.getDocument(documentId, workspaceId);

    return this.yjsDocumentService.getYDocForUpdate(
      this.yjsDocumentService.getDocId(documentId, null),
      documentId,
      null,
      workspaceId,
      work,
      this.persistorFactory.createDocumentPersistor(documentId),
    );
  }
}
