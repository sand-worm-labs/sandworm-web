import PQueue from 'p-queue'
import pg from 'pg'

let pubSubClient: pg.Client | null = null
let connectionString: string | null = null
let sslConfig: pg.ClientConfig['ssl'] = false
const getPubSubClientQueue = new PQueue({ concurrency: 1 })
const subscribers: Record<string, Set<(message?: string) => void>> = {}
const subscribeQueues: Record<string, PQueue> = {}
let reconnectingToPubSub = false

export type InitPubSubOptions = {
    connectionString: string
    ssl?:
    | 'prefer'
    | {
        rejectUnauthorized?: boolean
        ca?: string
    }
    | false
}

export const initPubSub = (options: InitPubSubOptions): void => {
    connectionString = options.connectionString

    if (options.ssl === 'prefer') {
        sslConfig = undefined
    } else if (options.ssl && typeof options.ssl === 'object') {
        sslConfig = {
            rejectUnauthorized: options.ssl.rejectUnauthorized ?? false,
            ca: options.ssl.ca,
        }
    } else {
        sslConfig = false
    }
}

async function getPubSubClient(): Promise<pg.Client> {
    if (pubSubClient) {
        return pubSubClient
    }

    const result = await getPubSubClientQueue.add(async () => {
        if (pubSubClient) {
            return pubSubClient
        }

        if (!connectionString) {
            throw new Error('Call initPubSub() before using pub/sub functions')
        }

        pubSubClient = new pg.Client({
            connectionString,
            ssl: sslConfig,
        })

        try {
            await pubSubClient.connect()
        } catch (err) {
            if (
                sslConfig === undefined &&
                err instanceof Error &&
                err.message === 'The server does not support SSL connections'
            ) {
                pubSubClient = new pg.Client({
                    connectionString,
                    ssl: false,
                })
                await pubSubClient.connect()
            } else {
                throw err
            }
        }

        pubSubClient.on('notification', (notification) => {
            const subs = subscribers[notification.channel]
            if (subs) {
                subs.forEach((sub) => sub(notification.payload))
            }
        })

        pubSubClient.on('error', (err) => {
            console.error('Got an error from the PG pubSubClient', err)
            reconnectPubSub()
        })

        return pubSubClient
    })

    if (!result) {
        throw new Error('Getting pubSubClient returned void')
    }

    return result
}

async function reconnectPubSub(): Promise<void> {
    if (!connectionString) {
        throw new Error('Unable to reconnect - connection string not set')
    }

    if (reconnectingToPubSub) {
        console.log('[reconnecting] Already reconnecting to PG PubSub')
        return
    }

    reconnectingToPubSub = true
    console.log('[reconnecting] Reconnecting to PG PubSub')

    while (Object.keys(subscribers).length > 0) {
        try {
            if (pubSubClient) {
                console.log('[reconnecting] Closing pubSubClient before reconnecting')
                await pubSubClient.end()
            }

            pubSubClient = null
            pubSubClient = await getPubSubClient()

            for (const channel of Object.keys(subscribers)) {
                await pubSubClient.query(`LISTEN ${JSON.stringify(channel)}`)
            }

            console.log('[reconnecting] Reconnected to PG PubSub successfully')
            break
        } catch (err) {
            console.error('[reconnecting] Error reconnecting to PG:', err)
            console.error('[reconnecting] Retrying in 1 second')
            await new Promise((resolve) => setTimeout(resolve, 1000))
        }
    }

    reconnectingToPubSub = false
}

function getSubscribeQueueForChannel(channel: string): PQueue {
    if (!subscribeQueues[channel]) {
        subscribeQueues[channel] = new PQueue({ concurrency: 1 })
    }
    return subscribeQueues[channel]
}

export async function subscribe(
    channel: string,
    onNotification: (message?: string) => void
): Promise<() => Promise<void>> {
    const queue = getSubscribeQueueForChannel(channel)

    await queue.add(async () => {
        const client = await getPubSubClient()

        const subs = subscribers[channel]
        if (subs) {
            subs.add(onNotification)
        } else {
            subscribers[channel] = new Set([onNotification])

            try {
                await client.query(`LISTEN ${JSON.stringify(channel)}`)
            } catch (e) {
                subscribers[channel].delete(onNotification)
                throw e
            }
        }
    })

    return async () => {
        await queue.add(async () => {
            const client = await getPubSubClient()
            const subs = subscribers[channel]

            if (!subs) {
                return
            }

            subs.delete(onNotification)

            if (subs.size === 0) {
                await client.query(`UNLISTEN ${JSON.stringify(channel)}`)
                delete subscribers[channel]
                delete subscribeQueues[channel]
            }
        })
    }
}

export async function publish(channel: string, message: string): Promise<void> {
    const client = await getPubSubClient()
    await client.query('SELECT pg_notify($1, $2)', [channel, message])
}