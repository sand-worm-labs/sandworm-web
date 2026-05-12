import { z } from 'zod';

const uuidSchema = z.string().uuid();

export const MessageYProtocol = z.object({
    id: z.string(),
    data: z.instanceof(Uint8Array),
    senderId: uuidSchema,
    targetId: z.union([z.literal('broadcast'), uuidSchema]),
    clock: z.number(),
});

export type MessageYProtocol = z.infer<typeof MessageYProtocol>;

export interface IPubSub {
    publish(message: MessageYProtocol): Promise<void>;
    subscribe(
        callback: (message: MessageYProtocol) => void,
    ): Promise<() => Promise<void>>;
}


export const SYNC_PROTOCOL_MESSAGE_TYPE = 0;
export const AWARENESS_PROTOCOL_MESSAGE_TYPE = 1;
export const PING_PROTOCOL_MESSAGE_TYPE = 2;
export const PONG_PROTOCOL_MESSAGE_TYPE = 3;

// Timing constants
export const PING_TIMEOUT = 1 * 1000;
export const RESYNC_INTERVAL = 2 * 1000;