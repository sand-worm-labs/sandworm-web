import * as Y from 'yjs';
import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

import { YjsDocumentService } from '../../collaboration/yjs/yjs-document.service';
import { PersistorFactory } from '../../collaboration/yjs/persistors/persistor.factory';

@Injectable()
export class TitleAiExecutorService {
    private readonly logger = new Logger(TitleAiExecutorService.name);

    constructor(
        private readonly yjsDocumentService: YjsDocumentService,
        private readonly persistorFactory: PersistorFactory,
    ) {}

    async updateTitle(
        documentId: string,
        workspaceId: string,
        server: Server,
        title: string,
    ): Promise<void> {
        try {
            const sharedDoc = await this._getSharedDoc(documentId, workspaceId, server);
            sharedDoc.ydoc.transact(() => {
                this._writeDocTitle(sharedDoc.ydoc, title);
            });
        } catch (err) {
            this.logger.error('updateTitle failed', err);
        }
    }

    async getTitle(
        documentId: string,
        workspaceId: string,
        server: Server,
    ): Promise<string> {
        const sharedDoc = await this._getSharedDoc(documentId, workspaceId, server);
        return this._getDocTitle(sharedDoc.ydoc);
    }

    private async _getSharedDoc(documentId: string, workspaceId: string, server: Server) {
        const docId = this.yjsDocumentService.getDocId(documentId, null);
        const persistor = this.persistorFactory.createDocumentPersistor(documentId);

        return this.yjsDocumentService.getYDocForUpdateAsync(
            docId,
            documentId,
            server,
            workspaceId,
            persistor,
        );
    }

    private _getDocTitle(ydoc: Y.Doc): string {
        const fragment = ydoc.getXmlFragment('title');
        if (fragment.length === 0) return '';

        const titleEl = fragment.get(0) as Y.XmlElement;
        if (!titleEl || titleEl.length === 0) return '';

        return (titleEl.get(0) as Y.XmlText).toString();
    }

    private _writeDocTitle(ydoc: Y.Doc, title: string): void {
        const fragment = ydoc.getXmlFragment('title');
        fragment.delete(0, fragment.length);

        const titleEl = new Y.XmlElement('doc-title');
        titleEl.insert(0, [new Y.XmlText(title)]);
        fragment.insert(0, [titleEl]);
    }
}