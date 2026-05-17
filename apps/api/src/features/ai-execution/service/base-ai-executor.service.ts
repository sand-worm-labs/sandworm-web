import * as Y from 'yjs';
import { Logger } from '@nestjs/common';
import { YjsDocumentService } from '../../collaboration/yjs/yjs-document.service';
import { PersistorFactory } from '../../collaboration/yjs/persistors/persistor.factory';

export abstract class BaseAiExecutorService {
    protected readonly logger = new Logger(this.constructor.name);

    constructor(
        protected readonly yjsDocumentService: YjsDocumentService,
        protected readonly persistorFactory: PersistorFactory,
    ) {}

    protected async getSharedDoc(documentId: string, workspaceId: string) {
        const docId = this.yjsDocumentService.getDocId(documentId, null);
        const persistor = this.persistorFactory.createDocumentPersistor(documentId);

        return this.yjsDocumentService.getYDocForUpdateAsync(
            docId,
            documentId,
            null,
            workspaceId,
            persistor,
        );
    }

    protected getXmlFragment(ydoc: Y.Doc, key: string): Y.XmlFragment {
        return ydoc.getXmlFragment(key);
    }

    protected transact(ydoc: Y.Doc, fn: () => void): void {
        ydoc.transact(fn);
    }
}