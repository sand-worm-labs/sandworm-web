import * as Y from 'yjs';
import { Logger } from '@nestjs/common';
import type { AITaskItem } from '@sandworm/editor';
import { YjsDocumentService } from '../../collaboration/yjs/yjs-document.service';
import { PersistorFactory } from '../../collaboration/yjs/persistors/persistor.factory';
import { DocumentContext } from '@/features/block-executor/interfaces';
import { GeneratorContext } from '@/infrastructure/ai/types/generator.types';

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

    // Runs a task's AI call and drops it the moment the user stops the task,
    // instead of waiting for an answer nobody wants. Returns false when stopped.
    protected async runUnlessStopped(
        taskItem: AITaskItem,
        call: (signal: AbortSignal) => Promise<unknown>,
    ): Promise<boolean> {
        const controller = new AbortController();
        const cleanup = taskItem.observeStatus(s => { if (s._tag === 'aborting') controller.abort(); });
        try {
            await call(controller.signal);
        } catch (err) {
            if (!controller.signal.aborted) throw err;
        } finally {
            cleanup();
        }
        return !controller.signal.aborted;
    }

    protected transact(ydoc: Y.Doc, fn: () => void): void {
        ydoc.transact(fn);
    }
}