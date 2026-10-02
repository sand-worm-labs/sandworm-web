import { Injectable } from '@nestjs/common';
import { getBlocks, writeDocTitle } from '@sandworm/editor';
import { DocumentService } from '../document/service/document.service';
import { PersistorFactory } from '../collaboration/yjs/persistors/persistor.factory';
import { addBlocks } from '../collaboration/yjs/shared-doc/ai-blocks';
import { YjsDocumentService } from '../collaboration/yjs/yjs-document.service';
import { WorkspaceMembershipService } from '../workspace/service/workspace-membership.service';
import { getDefinition, summarizeBlock } from './blocks/registry';
import type { BlockSummary } from './blocks/block-definition';
import type { CreateBlocksDto } from './dto/create-blocks.dto';

export type NotebookRef = { userId: string; workspaceId: string; documentId: string };

@Injectable()
export class NotebookBlocksService {
  constructor(
    private readonly yjsDocumentService: YjsDocumentService,
    private readonly persistorFactory: PersistorFactory,
    private readonly documentService: DocumentService,
    private readonly membershipService: WorkspaceMembershipService,
  ) {}

  async createBlocks(ref: NotebookRef, { blocks: inputs, position }: CreateBlocksDto): Promise<BlockSummary[]> {
    const specs = inputs.map(({ kind, ...input }) => getDefinition(kind).toSpec(input));
    const { ydoc } = await this.open(ref);

    const ids = addBlocks(ydoc, specs, position);
    const blocks = getBlocks(ydoc);
    return ids.map(id => summarizeBlock(blocks.get(id)!, blocks));
  }

  // The editor renders the title from the Yjs document; the database column
  // follows from the document's own title observer.
  async setTitle(ref: NotebookRef, title: string): Promise<void> {
    const { ydoc } = await this.open(ref);
    ydoc.transact(() => writeDocTitle(ydoc, title));
  }

  private async open({ userId, workspaceId, documentId }: NotebookRef) {
    await this.membershipService.assertActiveMember(workspaceId, userId);
    await this.documentService.getDocument(documentId, workspaceId);

    return this.yjsDocumentService.getYDocForUpdateAsync(
      this.yjsDocumentService.getDocId(documentId, null),
      documentId,
      null,
      workspaceId,
      this.persistorFactory.createDocumentPersistor(documentId),
    );
  }
}
