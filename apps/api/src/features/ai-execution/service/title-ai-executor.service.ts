import * as Y from 'yjs';
import { Injectable } from '@nestjs/common';
import { YjsDocumentService } from '../../collaboration/yjs/yjs-document.service';
import { PersistorFactory } from '../../collaboration/yjs/persistors/persistor.factory';
import { BaseAiExecutorService } from './base-ai-executor.service';

@Injectable()
export class TitleAiExecutorService extends BaseAiExecutorService {
    constructor(
        yjsDocumentService: YjsDocumentService,
        persistorFactory: PersistorFactory,
    ) {
        super(yjsDocumentService, persistorFactory);
    }

    async updateTitle(documentId: string, workspaceId: string, title: string): Promise<void> {
        try {
            const sharedDoc = await this.getSharedDoc(documentId, workspaceId);
        
            this.transact(sharedDoc.ydoc, () => {
                this._writeDocTitle(sharedDoc.ydoc, title);
            });
        } catch (err) {
            this.logger.error('updateTitle failed', err);
        }
    }

    async getTitle(documentId: string, workspaceId: string): Promise<string> {
        const sharedDoc = await this.getSharedDoc(documentId, workspaceId);
        return this._getDocTitle(sharedDoc.ydoc);
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