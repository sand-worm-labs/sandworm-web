import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, In } from 'typeorm';
import { PubSubPayloadEntity } from '@sandworm/postgresql-typeorm';

const PUB_SUB_PAYLOAD_TTL_MS = 1000 * 60 * 60 * 24;
const BATCH_SIZE = 1000;

@Injectable()
export class PubSubCleanupService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PubSubCleanupService.name);
    private isRunning = false;
    private shouldStop = false;

    constructor(
        @InjectRepository(PubSubPayloadEntity)
        private readonly payloadRepository: Repository<PubSubPayloadEntity>,
    ) { }

    async onModuleInit(): Promise<void> {
        this.logger.log('PubSub cleanup service initialized');
    }

    async onModuleDestroy(): Promise<void> {
        this.logger.log('Stopping PubSub cleanup service...');
        this.shouldStop = true;
        while (this.isRunning) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        this.logger.log('PubSub cleanup service stopped');
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async cleanupOldPayloads(): Promise<void> {
        if (this.isRunning) {
            this.logger.debug('Cleanup already running, skipping');
            return;
        }

        this.isRunning = true;
        this.shouldStop = false;

        try {
            const cutoffDate = new Date(Date.now() - PUB_SUB_PAYLOAD_TTL_MS);
            let totalDeleted = 0;

            while (!this.shouldStop) {
                const oldPayloads = await this.payloadRepository.find({
                    where: {
                        createdAt: LessThanOrEqual(cutoffDate),
                    },
                    select: ['id'],
                    take: BATCH_SIZE,
                });

                if (oldPayloads.length === 0) break;

                // Delete the batch
                const result = await this.payloadRepository.delete({
                    id: In(oldPayloads.map((p) => p.id)),
                });

                totalDeleted += result.affected ?? 0;

                if (oldPayloads.length < BATCH_SIZE) break;
            }

            if (totalDeleted > 0) {
                this.logger.log(`Cleaned up ${totalDeleted} old pubsub payloads`);
            }
        } catch (err) {
            this.logger.error(`Cleanup failed: ${err}`);
        } finally {
            this.isRunning = false;
        }
    }

    async triggerCleanup(): Promise<{ deleted: number }> {
        const cutoffDate = new Date(Date.now() - PUB_SUB_PAYLOAD_TTL_MS);
        let totalDeleted = 0;

        while (true) {
            const oldPayloads = await this.payloadRepository.find({
                where: {
                    createdAt: LessThanOrEqual(cutoffDate),
                },
                select: ['id'],
                take: BATCH_SIZE,
            });

            if (oldPayloads.length === 0) break;

            const result = await this.payloadRepository.delete({
                id: In(oldPayloads.map((p) => p.id)),
            });

            totalDeleted += result.affected ?? 0;

            if (oldPayloads.length < BATCH_SIZE) break;
        }

        return { deleted: totalDeleted };
    }
}