import * as Y from 'yjs';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { YjsDocumentService } from '../../collaboration/yjs/yjs-document.service';
import { PersistorFactory } from '../../collaboration/yjs/persistors/persistor.factory';
import { BlockActionEvent, BlockActionEventNames, BlockActionType } from '@/core/events/block-action.events';
import { DocumentContext } from '@/features/block-executor/interfaces';
import { GeneratorContext } from '@/infrastructure/ai/types/generator.types';

export abstract class BaseAiExecutorService {
    protected readonly logger = new Logger(this.constructor.name);

    constructor(
        protected readonly yjsDocumentService: YjsDocumentService,
        protected readonly persistorFactory: PersistorFactory,
        protected readonly eventEmitter: EventEmitter2,
    ) {}

    protected emitBlockAction(
        action: BlockActionType,
        blockType: string,
        block: Y.XmlElement<any>,
        ctx: GeneratorContext ,
    ): void {
        const event: BlockActionEvent = {
            action,
            blockType,
            blockId: block.getAttribute('id') ?? '',
            blockTitle: block.getAttribute('title') ?? '',
            chatId: ctx.chat_id,
        };
        this.eventEmitter.emit(BlockActionEventNames.BLOCK_ACTION, event);
    }

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