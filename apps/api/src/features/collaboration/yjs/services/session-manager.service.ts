import { Injectable, Logger } from '@nestjs/common';
import * as awarenessProtocol from 'y-protocols/awareness';
import { YjsDocumentService } from '@/features/collaboration/yjs/yjs-document.service';
import { DocumentSession, PERSIST_DEBOUNCE_MS } from "../types/yjs.types";

const IDLE_TIMEOUT = 5 * 60 * 1000;

@Injectable()
export class SessionManagerService {
    private readonly logger = new Logger(SessionManagerService.name);
    private readonly sessions = new Map<string, DocumentSession>();
    private cleanupInterval?: NodeJS.Timeout;

    constructor(private readonly yjsDocumentService: YjsDocumentService) { }

    getSessionKey(documentId: string, isApp: boolean, userId: string | null): string {
        if (isApp && userId) return `${documentId}:app:${userId}`;
        if (isApp) return `${documentId}:app:published`;
        return `${documentId}:edit`;
    }

    async getOrCreateSession(
        documentId: string,
        workspaceId: string,
        isApp: boolean,
        userId: string | null,
        onUpdate: (session: DocumentSession, update: Uint8Array, origin: any) => void,
        onAwarenessUpdate: (session: DocumentSession, changes: any, origin: any) => void,
    ): Promise<DocumentSession> {
        const sessionKey = this.getSessionKey(documentId, isApp, userId);
        let session = this.sessions.get(sessionKey);

        if (!session) {
            this.logger.debug(`🔧 Creating new session for ${sessionKey}`);

            const loadResult = isApp && userId
                ? await this.yjsDocumentService.loadAppYDoc(documentId, userId)
                : await this.yjsDocumentService.loadEditYDoc(documentId);

            const awareness = new awarenessProtocol.Awareness(loadResult.yDoc);
            awareness.setLocalState(null);

            session = {
                documentId,
                workspaceId,
                yDoc: loadResult.yDoc,
                awareness,
                conns: new Map(),
                clock: loadResult.clock,
                isApp,
                userId,
                lastPersist: Date.now(),
            };

            loadResult.yDoc.on('update', (update: Uint8Array, origin: any) => {
                onUpdate(session!, update, origin);
            });

            awareness.on('update', (changes: any, origin: any) => {
                onAwarenessUpdate(session!, changes, origin);
            });

            this.sessions.set(sessionKey, session);
            this.logger.log(`📄 Session created: ${sessionKey} (clock: ${session.clock})`);
        } else {
            this.logger.debug(`♻️  Reusing existing session: ${sessionKey}`);
        }

        return session;
    }

    schedulePersist(
        session: DocumentSession,
        persistFn: (session: DocumentSession) => Promise<void>,
    ) {
        if (session.persistTimeout) {
            clearTimeout(session.persistTimeout);
        }

        session.persistTimeout = setTimeout(async () => {
            try {
                const now = Date.now();
                if (session.conns.size === 0 || now - session.lastPersist > PERSIST_DEBOUNCE_MS) {
                    await persistFn(session);
                    session.lastPersist = now;
                }
            } catch (err) {
                this.logger.error(`Failed to persist session ${session.documentId}: ${err}`);
            }
        }, PERSIST_DEBOUNCE_MS);
    }

    startCleanup(persistFn: (session: DocumentSession) => Promise<void>) {
        this.cleanupInterval = setInterval(() => {
            const now = Date.now();

            for (const [key, session] of this.sessions.entries()) {
                if (session.conns.size === 0 && now - session.lastPersist > IDLE_TIMEOUT) {
                    this.logger.debug(`🧹 Cleaning up idle session ${key}`);

                    persistFn(session).catch((err) => {
                        this.logger.error(`Failed to persist on cleanup: ${err}`);
                    });

                    if (session.persistTimeout) clearTimeout(session.persistTimeout);
                    session.yDoc.destroy();
                    session.awareness.destroy();
                    this.sessions.delete(key);

                    this.logger.log(`♻️  Session cleaned up: ${key}`);
                }
            }
        }, 60000);
    }

    async destroyAll(persistFn: (session: DocumentSession) => Promise<void>) {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        const persistPromises = Array.from(this.sessions.values()).map((session) =>
            persistFn(session).catch((err) => {
                this.logger.error(`Failed to persist session ${session.documentId}: ${err}`);
            }),
        );

        await Promise.all(persistPromises);

        for (const session of this.sessions.values()) {
            if (session.persistTimeout) clearTimeout(session.persistTimeout);
            session.yDoc.destroy();
            session.awareness.destroy();
        }

        this.sessions.clear();
    }
}