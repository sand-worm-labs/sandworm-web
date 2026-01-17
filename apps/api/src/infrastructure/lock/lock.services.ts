import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import PQueue from 'p-queue';
import { z } from 'zod';
import { exhaustiveCheck } from '@sandworm/types';
import { PubSubService } from '../pubsub/service/pubsub.service';
import { LOCK_CONFIG } from './lock.constants';
import { AlreadyAcquiredError } from './lock.errors';
import { getChannel } from './lock.utils';
import { LockEntity } from "@sandworm/postgresql-typeorm"

@Injectable()
export class LockService implements OnModuleDestroy {
    private readonly logger = new Logger(LockService.name);
    private readonly queues = new Map<string, PQueue>();

    constructor(
        private readonly pubsub: PubSubService,
    ) { }

    async acquireLock<T>(name: string, cb: () => Promise<T>): Promise<T> {
        let lockQueue = this.queues.get(name);

        if (!lockQueue) {
            lockQueue = new PQueue({ concurrency: 1 });
            this.queues.set(name, lockQueue);
        }

        if (this.logger.isLevelEnabled('debug')) {
            this.logger.debug(
                `Enqueueing lock acquisition: ${name} (queue: ${lockQueue.size}, pending: ${lockQueue.pending})`,
            );
        }

        const result = await lockQueue.add(() => this.acquireLockInternal(name, cb));
        return result as T;
    }

    private async acquireLockInternal<T>(
        name: string,
        cb: () => Promise<T>,
    ): Promise<T> {
        const acquisitionQueue = new PQueue({ concurrency: 1 });
        const ownerId = uuidv4();
        const channel = getChannel(name);

        let acquired = false;
        let failed = false;
        let attempt = 0;
        let timeout: NodeJS.Timeout | null = null;

        return new Promise<T>(async (resolve, reject) => {
            let cleanSubscription: () => Promise<void> = async () => { };

            const tryAcquire = async () => {
                if (acquired || failed) {
                    return;
                }

                attempt++;

                if (this.logger.isLevelEnabled('debug')) {
                    this.logger.debug(
                        `Acquiring lock: ${name} (owner: ${ownerId}, attempt: ${attempt}, channel: ${channel})`,
                    );
                }

                try {
                    await this.attemptLockAcquisition(name, ownerId);
                } catch (err) {
                    const shouldRetry = this.handleAcquisitionError(
                        err,
                        name,
                        ownerId,
                        attempt,
                        channel,
                    );

                    if (shouldRetry) {
                        if (timeout) {
                            clearTimeout(timeout);
                        }
                        timeout = setTimeout(
                            () => acquisitionQueue.add(tryAcquire),
                            LOCK_CONFIG.RETRY_TIMEOUT,
                        );
                        return;
                    }

                    this.logger.error(
                        `Failed to acquire lock: ${name} (owner: ${ownerId})`,
                        err instanceof Error ? err.stack : String(err),
                    );

                    failed = true;

                    try {
                        await cleanSubscription();
                    } catch (cleanErr) {
                        this.logger.error(
                            `Failed to clean subscription: ${name}`,
                            cleanErr instanceof Error ? cleanErr.stack : String(cleanErr),
                        );
                    }

                    reject(err);
                    return;
                }

                // Lock acquired successfully
                const extendExpirationInterval = this.startExpirationExtension(
                    name,
                    ownerId,
                    channel,
                    attempt,
                );

                this.logger.log(`Lock acquired: ${name} (owner: ${ownerId}, attempt: ${attempt})`);
                acquired = true;

                try {
                    await cleanSubscription();
                } catch (err) {
                    this.logger.error(
                        `Failed to clean subscription: ${name}`,
                        err instanceof Error ? err.stack : String(err),
                    );
                }

                // Execute callback
                let result:
                    | { success: true; data: T }
                    | { success: false; error: unknown }
                    | null = null;

                try {
                    const data = await cb();
                    result = { success: true, data };
                } catch (err) {
                    result = { success: false, error: err };
                }

                // Release lock
                if (this.logger.isLevelEnabled('debug')) {
                    this.logger.debug(`Releasing lock: ${name} (owner: ${ownerId})`);
                }

                clearInterval(extendExpirationInterval);

                await this.releaseLock(name, ownerId, channel, attempt);

                if (result.success) {
                    resolve(result.data);
                } else {
                    failed = true;
                    reject(result.error);
                }
            };

            // Setup pub/sub subscription
            cleanSubscription = await this.pubsub.subscribe(
                channel,
                async (event) => {
                    if (acquired || failed) {
                        await cleanSubscription();
                        return;
                    }

                    if (event === name) {
                        if (this.logger.isLevelEnabled('debug')) {
                            this.logger.debug(
                                `Lock released notification: ${name} (queue: ${acquisitionQueue.size})`,
                            );
                        }

                        acquisitionQueue.clear();
                        acquisitionQueue.add(tryAcquire);
                    }
                },
            );

            acquisitionQueue.add(tryAcquire);
        });
    }

    private async attemptLockAcquisition(
        name: string,
        ownerId: string,
    ): Promise<void> {
        const lock = await this.prisma.lock.findFirst({
            where: { name },
        });

        if (!lock) {
            // Create new lock
            await this.prisma.lock.create({
                data: {
                    name,
                    isLocked: true,
                    ownerId,
                    expiresAt: new Date(Date.now() + LOCK_CONFIG.EXPIRATION_TIME),
                    acquiredAt: new Date(),
                },
            });
        } else if (!lock.isLocked || lock.expiresAt < new Date()) {
            // Update existing expired/unlocked lock
            await this.prisma.lock.update({
                where: {
                    id: lock.id,
                    clock: lock.clock,
                },
                data: {
                    isLocked: true,
                    ownerId,
                    expiresAt: new Date(Date.now() + LOCK_CONFIG.EXPIRATION_TIME),
                    acquiredAt: new Date(),
                    clock: { increment: 1 },
                },
            });
        } else {
            // Lock is already acquired
            throw new AlreadyAcquiredError(name);
        }
    }

    private handleAcquisitionError(
        err: unknown,
        name: string,
        ownerId: string,
        attempt: number,
        channel: string,
    ): boolean {
        let code = '';

        if (err instanceof AlreadyAcquiredError) {
            code = 'AlreadyAcquiredError';
        } else {
            const parsed = z
                .object({ code: z.union([z.literal('P2002'), z.literal('P2025')]) })
                .safeParse(err);

            if (parsed.success) {
                switch (parsed.data.code) {
                    case 'P2002':
                        code = 'UniqueConstraintError';
                        break;
                    case 'P2025':
                        code = 'NotFound';
                        break;
                    default:
                        exhaustiveCheck(parsed.data.code);
                }
            }
        }

        if (code !== '') {
            if (this.logger.isLevelEnabled('debug')) {
                this.logger.debug(
                    `Lock already acquired: ${name} (code: ${code}, retry: ${LOCK_CONFIG.RETRY_TIMEOUT}ms)`,
                );
            }
            return true;
        }

        return false;
    }

    private startExpirationExtension(
        name: string,
        ownerId: string,
        channel: string,
        attempt: number,
    ): NodeJS.Timeout {
        return setInterval(async () => {
            try {
                await this.prisma.lock.updateMany({
                    where: { name, ownerId },
                    data: {
                        expiresAt: new Date(Date.now() + LOCK_CONFIG.EXPIRATION_TIME),
                    },
                });
            } catch (err) {
                this.logger.error(
                    `Failed to extend lock expiration: ${name}`,
                    err instanceof Error ? err.stack : String(err),
                );
            }
        }, LOCK_CONFIG.EXPIRATION_TIME / 3);
    }

    private async releaseLock(
        name: string,
        ownerId: string,
        channel: string,
        attempt: number,
    ): Promise<void> {
        try {
            await this.prisma.lock.updateMany({
                where: { name, ownerId },
                data: { isLocked: false },
            });

            this.logger.log(`Lock released: ${name} (owner: ${ownerId})`);
        } catch (err) {
            this.logger.error(
                `Failed to release lock: ${name}`,
                err instanceof Error ? err.stack : String(err),
            );
        }

        try {
            await this.pubsub.publish(channel, name);
        } catch (err) {
            this.logger.error(
                `Failed to publish lock release: ${name}`,
                err instanceof Error ? err.stack : String(err),
            );
        }
    }

    async onModuleDestroy() {
        this.logger.log('Clearing all lock queues');

        for (const [name, queue] of this.queues) {
            queue.clear();
        }

        this.queues.clear();
    }
}