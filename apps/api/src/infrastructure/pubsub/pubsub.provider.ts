import pAll from 'p-all';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import { v4 as uuidv4 } from 'uuid';
import { decoding, encoding } from 'lib0';
import { Logger } from '@nestjs/common';
import PQueue from 'p-queue';
import { PubSubService } from './service/pubsub.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PubSubPayloadEntity } from '@sandworm/postgresql-typeorm';
import {
    MessageYProtocol,
    SYNC_PROTOCOL_MESSAGE_TYPE,
    AWARENESS_PROTOCOL_MESSAGE_TYPE,
    PING_PROTOCOL_MESSAGE_TYPE,
    PONG_PROTOCOL_MESSAGE_TYPE,
    PING_TIMEOUT,
    RESYNC_INTERVAL,
} from './pubsub.types';

export class PubSubProvider {
    private readonly logger = new Logger(PubSubProvider.name);
    private pubsubId = uuidv4();
    private cleanup: (() => Promise<void>) | null = null;
    private syncedPeers = new Map<string, { waitingPong: boolean }>();
    private resyncInterval: NodeJS.Timeout | null = null;
    private pingInterval: NodeJS.Timeout | null = null;
    private updateHandlerQueue: PQueue = new PQueue({ concurrency: 1 });
    private pendingUpdates: { update: Uint8Array; origin: any }[] = [];

    constructor(
        private readonly id: string,
        private ydoc: Y.Doc,
        private clock: number,
        private readonly pubSubService: PubSubService,
        private readonly payloadRepository: Repository<PubSubPayloadEntity>,
        private readonly onNewerClock: (clock: number) => Promise<void>
    ) { }

    public getSyncedPeers() {
        return this.syncedPeers;
    }

    public async connect() {
        if (this.cleanup) return;

        this.cleanup = await this.pubSubService.subscribe(
            this.getChannel(),
            async (messageStr) => { await this.onSubMessage(messageStr); }
        );

        // handlers first, before any async fire-and-forget
        this.ydoc.on('update', this.updateHandler);

        this.resyncInterval = setInterval(() => {
            this.sendSync1('broadcast');
        }, RESYNC_INTERVAL);

        this.pingInterval = setTimeout(this.onPingInterval, PING_TIMEOUT);

        // fire and forget — this is peer-to-peer sync for other server instances
        // the connecting client gets state via the WebSocket sync handshake, not this
        this.sendSync1('broadcast').catch((err) =>
            this.logger.error(`Failed initial sync broadcast: ${err}`)
        );
    }
     public async disconnect() {
        if (!this.cleanup) {
            this.logger.warn(`Called disconnect but already disconnected for ${this.id}`);
            return;
        }

        if (this.resyncInterval) {
            clearInterval(this.resyncInterval);
            this.resyncInterval = null;
        }

        if (this.pingInterval) {
            clearTimeout(this.pingInterval);
            this.pingInterval = null;
        }

        this.ydoc.off('update', this.updateHandler);
        await this.updateHandlerQueue.onIdle();

        await this.cleanup();
        this.cleanup = null;

        this.logger.debug(`PubSubProvider disconnected for ${this.id}`);
    }

    public async reset(newYdoc: Y.Doc, newClock: number) {
        await this.disconnect();
        this.ydoc = newYdoc;
        this.clock = newClock;
        this.syncedPeers = new Map();
        await this.connect();
    }

    private onPingInterval = async () => {
        for (const [peer, { waitingPong }] of this.syncedPeers) {
            if (waitingPong) {
                this.logger.debug(`Peer ${peer} did not respond to ping, removing`);
                this.syncedPeers.delete(peer);
            }
        }

        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, PING_PROTOCOL_MESSAGE_TYPE);
        const data = encoding.toUint8Array(encoder);

        await pAll(
            Array.from(this.syncedPeers.keys()).map((peer) => async () => {
                await this.publish({
                    id: this.id,
                    data: Uint8Array.from(data),
                    clock: this.clock,
                    senderId: this.pubsubId,
                    targetId: peer,
                });
                this.syncedPeers.set(peer, { waitingPong: true });
            }),
            { concurrency: 5 }
        );

        this.pingInterval = setTimeout(this.onPingInterval, PING_TIMEOUT);
    };

    private updateHandler = async (update: Uint8Array, origin: any) => {
        this.pendingUpdates.push({ update, origin });

        await this.updateHandlerQueue.add(async () => {
            const updates = this.pendingUpdates;
            this.pendingUpdates = [];

            if (updates.length === 0) {
                return;
            }

            const isAllOwnUpdates = updates.every(({ origin }) => origin === this);
            if (isAllOwnUpdates) {
                return;
            }

            const mergedUpdate = Y.mergeUpdates(updates.map(({ update }) => update));

            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, SYNC_PROTOCOL_MESSAGE_TYPE);
            syncProtocol.writeUpdate(encoder, mergedUpdate);
            const data = encoding.toUint8Array(encoder);

            await pAll(
                Array.from(this.syncedPeers.keys()).map((peer) => async () => {
                    await this.publish({
                        id: this.id,
                        data: Uint8Array.from(data),
                        clock: this.clock,
                        senderId: this.pubsubId,
                        targetId: peer,
                    });
                }),
                { concurrency: 5 }
            );
        });
    };

    private async sendSync1(targetId: string) {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, SYNC_PROTOCOL_MESSAGE_TYPE);
        syncProtocol.writeSyncStep1(encoder, this.ydoc);

        const data = encoding.toUint8Array(encoder);
        await this.publish({
            id: this.id,
            data: Uint8Array.from(data),
            clock: this.clock,
            senderId: this.pubsubId,
            targetId,
        });
    }

    private async publish(message: MessageYProtocol) {
        // Store the binary payload in the database
        const payload = await this.payloadRepository.save({
            payload: Buffer.from(message.data),
        });

        // Publish a lightweight message reference
        const messageRef = {
            id: message.id,
            senderId: message.senderId,
            targetId: message.targetId,
            clock: message.clock,
            payloadId: payload.id,
            channel: this.getChannel(),
        };

        await this.pubSubService.publish(
            this.getPgChannel(),
            JSON.stringify(messageRef)
        );
    }

    private async onSubMessage(messageStr: string) {
        try {
            const messageRef = JSON.parse(messageStr);

            // Verify this message is for our channel (PG channel name collisions)
            if (messageRef.channel !== this.getChannel()) {
                return;
            }

            if (messageRef.id !== this.id) {
                return;
            }

            if (messageRef.senderId === this.pubsubId) {
                return;
            }

            if (
                messageRef.targetId !== 'broadcast' &&
                messageRef.targetId !== this.pubsubId
            ) {
                return;
            }

            // Fetch the actual payload from the database
            const dbPayload = await this.payloadRepository.findOne({
                where: { id: messageRef.payloadId },
            });

            if (!dbPayload) {
                this.logger.error(
                    `Could not find pubsub payload ${messageRef.payloadId}`
                );
                return;
            }

            const message: MessageYProtocol = {
                id: messageRef.id,
                data: new Uint8Array(dbPayload.payload),
                senderId: messageRef.senderId,
                targetId: messageRef.targetId,
                clock: messageRef.clock,
            };

            if (message.clock < this.clock) {
                return;
            }

            if (message.clock > this.clock) {
                await this.onNewerClock(message.clock);
                return;
            }

            await this.handleMessage(message);
        } catch (err) {
            this.logger.error(`Failed to handle pubsub message: ${err}`);
        }
    }

    private async handleMessage(message: MessageYProtocol) {
        const encoder = encoding.createEncoder();
        const decoder = decoding.createDecoder(message.data);
        const protocolType = decoding.readVarUint(decoder);

        switch (protocolType) {
            case SYNC_PROTOCOL_MESSAGE_TYPE:
                encoding.writeVarUint(encoder, SYNC_PROTOCOL_MESSAGE_TYPE);
                this.readSyncMessage(message, decoder, encoder, this);

                if (encoding.length(encoder) > 1) {
                    const encodedMessage = encoding.toUint8Array(encoder);
                    await this.publish({
                        id: this.id,
                        data: Uint8Array.from(encodedMessage),
                        clock: this.clock,
                        senderId: this.pubsubId,
                        targetId: message.senderId,
                    });
                }
                break;

            case AWARENESS_PROTOCOL_MESSAGE_TYPE:
                this.logger.warn('Awareness messages not supported');
                break;

            case PING_PROTOCOL_MESSAGE_TYPE:
                await this.readPingMessage(message, encoder);
                break;

            case PONG_PROTOCOL_MESSAGE_TYPE:
                this.readPongMessage(message);
                break;

            default:
                this.logger.error(`Unknown protocol type: ${protocolType}`);
        }
    }

    private readSyncMessage(
        message: MessageYProtocol,
        decoder: decoding.Decoder,
        encoder: encoding.Encoder,
        transactionOrigin: any
    ): number {
        const messageType = decoding.readVarUint(decoder);

        switch (messageType) {
            case syncProtocol.messageYjsSyncStep1:
                this.readSyncStep1(message, decoder, encoder);
                break;
            case syncProtocol.messageYjsSyncStep2:
                this.readSyncStep2(message, decoder, transactionOrigin);
                break;
            case syncProtocol.messageYjsUpdate:
                this.readUpdate(message, decoder, transactionOrigin);
                break;
            default:
                this.logger.error(`Unknown sync message type: ${messageType}`);
        }

        return messageType;
    }

    private readSyncStep1(
        message: MessageYProtocol,
        decoder: decoding.Decoder,
        encoder: encoding.Encoder
    ) {
        this.syncedPeers.set(message.senderId, { waitingPong: false });
        syncProtocol.readSyncStep1(decoder, encoder, this.ydoc);
    }

    private readSyncStep2(
        message: MessageYProtocol,
        decoder: decoding.Decoder,
        transactionOrigin: any
    ) {
        syncProtocol.readSyncStep2(decoder, this.ydoc, transactionOrigin);
        this.syncedPeers.set(message.senderId, { waitingPong: false });
    }

    private readUpdate(
        message: MessageYProtocol,
        decoder: decoding.Decoder,
        transactionOrigin: any
    ) {
        syncProtocol.readUpdate(decoder, this.ydoc, transactionOrigin);
    }

    private async readPingMessage(
        message: MessageYProtocol,
        encoder: encoding.Encoder
    ) {
        encoding.writeVarUint(encoder, PONG_PROTOCOL_MESSAGE_TYPE);
        await this.publish({
            id: this.id,
            data: Uint8Array.from(encoding.toUint8Array(encoder)),
            clock: this.clock,
            senderId: this.pubsubId,
            targetId: message.senderId,
        });
    }

    private readPongMessage(message: MessageYProtocol) {
        if (this.syncedPeers.has(message.senderId)) {
            this.syncedPeers.set(message.senderId, { waitingPong: false });
        }
    }

    private getChannel(): string {
        return `yjs:${this.id}`;
    }

    // PostgreSQL channel names are limited to 63 characters
    private getPgChannel(): string {
        return this.getChannel().slice(0, 63);
    }
}