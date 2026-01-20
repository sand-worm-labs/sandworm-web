import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import PQueue from 'p-queue'
import { z } from 'zod'
import { exhaustiveCheck } from '@sandworm/types'
import { PubSubService } from '../pubsub/service/pubsub.service'
import { LOCK_CONFIG } from './lock.constants'
import { AlreadyAcquiredError } from './lock.errors'
import { getChannel } from './lock.utils'
import { LockEntity } from '@sandworm/postgresql-typeorm';

@Injectable()
export class LockService implements OnModuleDestroy {
    private readonly logger = new Logger(LockService.name)
    private readonly queues = new Map<string, PQueue>()

    constructor(
        private readonly pubsub: PubSubService,
        @InjectRepository(LockEntity)
        private readonly lockRepository: Repository<LockEntity>,
    ) { }

    private debugEnabled() {
        return Logger.isLevelEnabled('debug')
    }

    async acquireLock<T>(name: string, cb: () => Promise<T>): Promise<T> {
        let queue = this.queues.get(name)

        if (!queue) {
            queue = new PQueue({ concurrency: 1 })
            this.queues.set(name, queue)
        }

        if (this.debugEnabled()) {
            this.logger.debug(
                `Enqueue lock: ${name} (size=${queue.size}, pending=${queue.pending})`,
            )
        }

        return queue.add(() => this.acquireInternal(name, cb)) as Promise<T>
    }

    private async acquireInternal<T>(
        name: string,
        cb: () => Promise<T>,
    ): Promise<T> {
        const acquisitionQueue = new PQueue({ concurrency: 1 })
        const ownerId = uuidv4()
        const channel = getChannel(name)

        let acquired = false
        let finished = false
        let timeout: NodeJS.Timeout | null = null

        let unsubscribe: () => Promise<void> = async () => { }

        const tryAcquire = async () => {
            if (acquired || finished) return

            if (this.debugEnabled()) {
                this.logger.debug(`Trying lock: ${name} (${ownerId})`)
            }

            try {
                await this.attemptLockAcquisition(name, ownerId)

                acquired = true
                await unsubscribe()

                this.logger.log(`Lock acquired: ${name} (${ownerId})`)

                const extender = this.startExpirationExtension(name, ownerId)

                try {
                    return await cb()
                } finally {
                    clearInterval(extender)
                    await this.releaseLock(name, ownerId, channel)
                }
            } catch (err) {
                if (this.shouldRetry(err)) {
                    if (timeout) clearTimeout(timeout)
                    timeout = setTimeout(
                        () => acquisitionQueue.add(tryAcquire),
                        LOCK_CONFIG.RETRY_TIMEOUT,
                    )
                    return
                }

                finished = true
                await unsubscribe()
                throw err
            }
        }

        unsubscribe = await this.pubsub.subscribe(channel, async (event) => {
            if (!acquired && event === name) {
                acquisitionQueue.clear()
                acquisitionQueue.add(tryAcquire)
            }
        })

        return acquisitionQueue.add(tryAcquire) as Promise<T>
    }

    private async attemptLockAcquisition(
        name: string,
        ownerId: string,
    ): Promise<void> {
        const lock = await this.lockRepository.findOne({ where: { name } })
        const expiresAt = new Date(Date.now() + LOCK_CONFIG.EXPIRATION_TIME)

        if (!lock) {
            await this.lockRepository.insert({
                name,
                isLocked: true,
                ownerId,
                expiresAt,
                acquiredAt: new Date(),
                clock: '0',
            })
            return
        }

        if (!lock.isLocked || lock.expiresAt < new Date()) {
            const result = await this.lockRepository.update(
                { id: lock.id, clock: lock.clock },
                {
                    isLocked: true,
                    ownerId,
                    expiresAt,
                    acquiredAt: new Date(),
                    clock: String(BigInt(lock.clock) + 1n),
                },
            )

            if (result.affected === 0) {
                throw new AlreadyAcquiredError(name)
            }

            return
        }

        throw new AlreadyAcquiredError(name)
    }

    private shouldRetry(err: unknown): boolean {
        if (err instanceof AlreadyAcquiredError) return true

        const parsed = z
            .object({ code: z.union([z.literal('P2002'), z.literal('P2025')]) })
            .safeParse(err)

        if (!parsed.success) return false

        switch (parsed.data.code) {
            case 'P2002':
            case 'P2025':
                return true
            default:
                exhaustiveCheck(parsed.data.code)
                return false
        }
    }

    private startExpirationExtension(
        name: string,
        ownerId: string,
    ): NodeJS.Timeout {
        return setInterval(async () => {
            try {
                await this.lockRepository.update(
                    { name, ownerId },
                    { expiresAt: new Date(Date.now() + LOCK_CONFIG.EXPIRATION_TIME) },
                )
            } catch (err) {
                this.logger.error(
                    `Failed to extend lock: ${name}`,
                    err instanceof Error ? err.stack : String(err),
                )
            }
        }, LOCK_CONFIG.EXPIRATION_TIME / 3)
    }

    private async releaseLock(
        name: string,
        ownerId: string,
        channel: string,
    ): Promise<void> {
        try {
            await this.lockRepository.update(
                { name, ownerId },
                { isLocked: false },
            )
            this.logger.log(`Lock released: ${name} (${ownerId})`)
        } catch (err) {
            this.logger.error(
                `Failed to release lock: ${name}`,
                err instanceof Error ? err.stack : String(err),
            )
        }

        try {
            await this.pubsub.publish(channel, name)
        } catch (err) {
            this.logger.error(
                `Failed to publish lock release: ${name}`,
                err instanceof Error ? err.stack : String(err),
            )
        }
    }

    onModuleDestroy() {
        this.logger.log('Clearing lock queues')
        for (const queue of this.queues.values()) queue.clear()
        this.queues.clear()
    }
}
