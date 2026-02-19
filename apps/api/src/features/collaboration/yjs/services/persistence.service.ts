import { Injectable, Logger } from '@nestjs/common';
import { YjsDocumentService } from '@/features/collaboration/yjs/yjs-document.service';
import { WSSharedDoc } from '../interfaces';
import { PersistorFactory } from '../persistors/persistor.factory';


@Injectable()
export class PersistenceService {
    private readonly logger = new Logger(PersistenceService.name);

    constructor(
        private readonly yjsDocumentService: YjsDocumentService,
        private readonly persistorFactory: PersistorFactory
    ) { }

    async persistSession(session: WSSharedDoc): Promise<void> {
        this.logger.debug(`💾 Persisting session ${session.documentId}`);

        if (session.isApp && session.userId) {
            this.logger.warn('App document persistence requires yjsAppDocumentId - skipping');
            return;
        }

        await this.yjsDocumentService.saveEditYDoc(session.documentId, session.ydoc);
        this.logger.debug(`✅ Successfully persisted session ${session.documentId}`);
    }

    async validateAndFixClock(
        session: WSSharedDoc,
        clock: number,
    ): Promise<boolean> {
        try {
            const loadResult = session.isApp && session.userId
                ? await this.persistorFactory.createAppPersistor(session.documentId, session.appId, session.userId).load()
                : await this.persistorFactory.createDocumentPersistor(session.documentId).load();

            if (loadResult.clock === clock) {
                this.logger.warn(`🔧 Fixing session clock from ${session.clock} to ${clock}`);
                session.clock = clock;
                return true;
            }

            this.logger.error(
                `❌ Clock mismatch: user=${clock}, session=${session.clock}, db=${loadResult.clock}`,
            );
            return false;
        } catch (err) {
            this.logger.error(`Failed to validate clock: ${err}`);
            return false;
        }
    }
}