import { Injectable, Logger } from '@nestjs/common';
import { WSSharedDoc } from '../interfaces/ws-shared-doc.interface';
import { SharedDoc } from '../shared-doc/ws-shared-doc';

@Injectable()
export class PersistenceService {
    private readonly logger = new Logger(PersistenceService.name);

    async persistSession(session: WSSharedDoc): Promise<void> {
        try {
            const persistor = (session as SharedDoc).getPersistor();
            await persistor.persist(session);
            session.lastPersist = Date.now();
            this.logger.debug(`✅ Persisted session: ${session.documentId}`);
        } catch (err) {
            this.logger.error(`Failed to persist session ${session.documentId}: ${err}`);
            throw err;
        }
    }

    async validateAndFixClock(session: WSSharedDoc, clock: number): Promise<boolean> {
        try {
            const persistor = (session as SharedDoc).getPersistor();
            const loadResult = await persistor.load();

            if (loadResult.clock === clock) {
                this.logger.warn(
                    `🔧 Fixing session clock: session=${session.clock} → client=${clock}`,
                );
                session.clock = clock;
                return true;
            }

            this.logger.error(
                `❌ Clock mismatch: client=${clock}, session=${session.clock}, db=${loadResult.clock}`,
            );
            return false;
        } catch (err) {
            this.logger.error(`Failed to validate clock for ${session.documentId}: ${err}`);
            return false;
        }
    }
}