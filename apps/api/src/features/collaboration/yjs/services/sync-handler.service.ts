import { Injectable, Logger } from '@nestjs/common';
import { encoding, decoding } from 'lib0';
import * as syncProtocol from 'y-protocols/sync';
import { UserWorkspaceRole } from '@sandworm/postgresql-typeorm';
import { DocumentSession } from '../types/yjs.types';
import { SharedDoc } from '../shared-doc/ws-shared-doc';


@Injectable()
export class SyncHandlerService {
    private readonly logger = new Logger(SyncHandlerService.name);

    readSyncMessage(
        decoder: decoding.Decoder,
        encoder: encoding.Encoder,
        session: SharedDoc,
        transactionOrigin: any,
    ): number {
        const messageType = decoding.readVarUint(decoder);

        switch (messageType) {
            case syncProtocol.messageYjsSyncStep1:
                this.logger.debug('🔄 Processing sync step 1');
                syncProtocol.readSyncStep1(decoder, encoder, session.ydoc);
                break;

            case syncProtocol.messageYjsSyncStep2:
                this.logger.debug('🔄 Processing sync step 2');

                if (transactionOrigin.role === UserWorkspaceRole.VIEWER) {
                    this.logger.warn('⛔ Viewer attempted to write, rejecting');
                    throw new Error('VIEWER_WRITE_REJECTED');
                }

                syncProtocol.readSyncStep2(decoder, session.ydoc, transactionOrigin);
                break;

            case syncProtocol.messageYjsUpdate:
                this.logger.debug('🔄 Processing update');

                if (transactionOrigin.role === UserWorkspaceRole.VIEWER) {
                    this.logger.warn('⛔ Viewer attempted to write, rejecting');
                    throw new Error('VIEWER_WRITE_REJECTED');
                }

                syncProtocol.readUpdate(decoder, session.ydoc, transactionOrigin);
                break;

            default:
                throw new Error(`Unknown sync message type: ${messageType}`);
        }

        return messageType;
    }

    async sendInitialState(
        session: SharedDoc,
        sendFn: (message: Uint8Array) => void,
    ) {
        this.logger.debug('📤 Sending sync step 1');

        const syncEncoder = encoding.createEncoder();
        encoding.writeVarUint(syncEncoder, 0); // messageSync
        syncProtocol.writeSyncStep1(syncEncoder, session.ydoc);
        sendFn(encoding.toUint8Array(syncEncoder));

        const awarenessStates = session.awareness.getStates();
        if (awarenessStates.size > 0) {
            

            const awarenessEncoder = encoding.createEncoder();
            encoding.writeVarUint(awarenessEncoder, 1); // messageAwareness
            const awarenessProtocol = require('y-protocols/awareness');
            encoding.writeVarUint8Array(
                awarenessEncoder,
                awarenessProtocol.encodeAwarenessUpdate(
                    session.awareness,
                    Array.from(awarenessStates.keys()),
                ),
            );
            sendFn(encoding.toUint8Array(awarenessEncoder));
        }
    }
}