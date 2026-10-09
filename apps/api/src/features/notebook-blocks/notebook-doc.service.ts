import { Injectable, NotFoundException } from '@nestjs/common';
import { DocumentVisibility } from '@sandworm/postgresql-typeorm';
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

  // Hands `work` the caller's own copy of the published notebook: the one the
  // view page shows. Open to any member, and to anyone when shared by link.
  async useView<T>({ userId, workspaceId, documentId }: NotebookRef, work: (doc: SharedDoc) => T | Promise<T>): Promise<T> {
    const document = await this.documentService.getDocument(documentId, workspaceId);
    if (document.visibility !== DocumentVisibility.LINK) {
      await this.membershipService.assertActiveMember(workspaceId, userId);
    }

    const appDocument = await this.yjsDocumentService.getAppDocument(documentId);
    if (!appDocument) throw new NotFoundException('This notebook has not been saved yet');
    const appDocumentId = appDocument.id;

    const app = { id: appDocumentId, userId };
    return this.yjsDocumentService.getYDocForUpdate(
      this.yjsDocumentService.getDocId(documentId, app),
      documentId,
      null,
      workspaceId,
      async doc => {
        // A copy still in memory from before the last save would show the old notebook.
        await doc.reloadIfBehind(appDocument.clock);
        return work(doc);
      },
      this.persistorFactory.createAppPersistor(documentId, appDocumentId, userId),
    );
  }
}
