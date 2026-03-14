import { Injectable, Logger } from '@nestjs/common';
import { encoding, decoding } from 'lib0';
import * as awarenessProtocol from 'y-protocols/awareness';
import { SyncHandlerService } from './sync-handler.service';
import { MESSAGE_SYNC, MESSAGE_AWARENESS, DocumentSession } from '../types/yjs.types';
import { WSSharedDocV2 } from '../shared-doc/ws-shared-doc';


@Injectable()
export class MessageHandlerService {
    private readonly logger = new Logger(MessageHandlerService.name);

    constructor(private readonly syncHandler: SyncHandlerService) { }

    handleMessage(
        session: WSSharedDocV2,
        message: Uint8Array,
        transactionOrigin: any,
        sendFn: (message: Uint8Array) => void,
    ) {
        try {
            const encoder = encoding.createEncoder();
            const decoder = decoding.createDecoder(message);
            const messageType = decoding.readVarUint(decoder);

            switch (messageType) {
                case MESSAGE_SYNC:
                    encoding.writeVarUint(encoder, MESSAGE_SYNC);
                    this.syncHandler.readSyncMessage(
                        decoder,
                        encoder,
                        session,
                        transactionOrigin,
                    );

                    if (encoding.length(encoder) > 1) {
                        sendFn(encoding.toUint8Array(encoder));
                    }
                    break;

                case MESSAGE_AWARENESS:
                    awarenessProtocol.applyAwarenessUpdate(
                        session.awareness,
                        decoding.readVarUint8Array(decoder),
                        transactionOrigin,
                    );
                    break;

                default:
                    this.logger.warn(`Unknown message type: ${messageType}`);
            }
        } catch (err) {
            this.logger.error(`Failed to handle message: ${err}`);
        }
    }

    handleYDocUpdate(
        session: WSSharedDocV2,
        update: Uint8Array,
        broadcastFn: (message: Uint8Array) => void,
    ) {
        this.logger.debug(`📝 Document update for ${session.documentId}`);

        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, MESSAGE_SYNC);
        const syncProtocol = require('y-protocols/sync');
        syncProtocol.writeUpdate(encoder, update);
        const message = encoding.toUint8Array(encoder);

        broadcastFn(message);
    }

    handleAwarenessUpdate(
        session: WSSharedDocV2,
        changes: { added: number[]; updated: number[]; removed: number[] },
        origin: any,
        broadcastFn: (message: Uint8Array) => void,
    ) {
        const { added, updated, removed } = changes;
        const changedClients = added.concat(updated, removed);

        if (origin !== null && origin.conn) {
            const connControlledIDs = session.conns.get(origin.conn);
            if (connControlledIDs !== undefined) {
                added.forEach((clientID) => connControlledIDs.add(clientID));
                removed.forEach((clientID) => connControlledIDs.delete(clientID));
            }
        }

        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
        encoding.writeVarUint8Array(
            encoder,
            awarenessProtocol.encodeAwarenessUpdate(session.awareness, changedClients),
        );

        broadcastFn(encoding.toUint8Array(encoder));
    }
}