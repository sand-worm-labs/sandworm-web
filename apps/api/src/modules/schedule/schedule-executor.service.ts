// apps/api/src/modules/schedule/schedule-executor.service.ts

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CronJob } from 'cron';
import {
    DocumentEntity,
    ExecutionScheduleEntity,
    ExecutionScheduleType,
    YjsAppDocumentEntity,
} from '@sandworm/postgresql-typeorm';
import { LockService } from '@sandworm/redis';

interface JobInfo {
    job: CronJob<null, string>;
    cron: string;
}

@Injectable()
export class ScheduleExecutorService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(ScheduleExecutorService.name);

    private readonly jobs: Map<string, JobInfo> = new Map();
    private readonly running: Map<string, Promise<void>> = new Map();
    private stopRequested = false;
    private lockAcquired = false;
    private updateLoop?: Promise<void>;

    constructor(
        @InjectRepository(ExecutionScheduleEntity)
        private readonly scheduleRepository: Repository<ExecutionScheduleEntity>,
        @InjectRepository(DocumentEntity)
        private readonly documentRepository: Repository<DocumentEntity>,
        @InjectRepository(YjsAppDocumentEntity)
        private readonly yjsAppRepository: Repository<YjsAppDocumentEntity>,
        private readonly lockService: LockService,
    ) { }

    async onModuleInit() {
        this.updateLoop = this.startExecutionEngine();

        this.updateLoop.catch((err) => {
            this.logger.error('Critical error in schedule execution engine', err);
        });
    }

    async onModuleDestroy() {
        await this.stopExecutionEngine();
    }

    private convertToCron(schedule: ExecutionScheduleEntity): string {
        switch (schedule.type) {
            case ExecutionScheduleType.HOURLY:
                return `0 ${schedule.minute} * * * *`;

            case ExecutionScheduleType.DAILY:
                return `0 ${schedule.minute} ${schedule.hour} * * *`;

            case ExecutionScheduleType.WEEKLY: {
                const weekdaysArray = schedule.weekdays?.split(',').map(Number) || [];
                const weekdaysCron = weekdaysArray
                    .map((day: number) => day % 7)
                    .join(',');
                return `0 ${schedule.minute} ${schedule.hour} * * ${weekdaysCron}`;
            }

            case ExecutionScheduleType.MONTHLY: {
                const daysArray = schedule.days?.split(',').map(Number) || [];
                const daysCron = daysArray.map((d) => d + 1).join(',');
                return `0 ${schedule.minute} ${schedule.hour} ${daysCron} * *`;
            }

            case ExecutionScheduleType.CRON:
                return schedule.cron!;

            default:
                throw new Error(`Unknown schedule type: ${schedule.type}`);
        }
    }

    private async startExecutionEngine(): Promise<void> {
        this.logger.log('Starting schedule execution engine');

        try {
            await this.runUpdateLoop();
        } catch (err) {
            this.logger.error('Schedule execution engine failed', err);
            throw err;
        }
    }

    private async stopExecutionEngine(): Promise<void> {
        this.logger.log('[shutdown] Stopping schedule execution engine');

        this.stopRequested = true;

        if (this.lockAcquired && this.updateLoop) {
            await this.updateLoop;
        }

        for (const jobInfo of this.jobs.values()) {
            jobInfo.job.stop();
        }

        while (this.running.size > 0) {
            this.logger.log(
                `[shutdown] Waiting for ${this.running.size} running jobs to finish`,
            );
            await Promise.all(Array.from(this.running.values()));
        }

        this.logger.log('[shutdown] All schedule jobs finished');
    }

    private async runUpdateLoop(): Promise<void> {
        try {
            await this.lockService.acquireLock('schedule-executor', async () => {
                this.lockAcquired = true;

                if (this.stopRequested) {
                    return;
                }

                this.logger.log(
                    'Schedule executor lock acquired - this instance will execute schedules',
                );

                while (!this.stopRequested) {
                    try {
                        await this.syncSchedules();
                    } catch (err) {
                        this.logger.error('Failed to sync schedules', err);
                    }

                    if (this.stopRequested) break;

                    await this.sleep(5000);
                }
            });
        } catch (err) {
            this.logger.error('Failed to run schedule update loop', err);
            throw err;
        }
    }

    private async syncSchedules(): Promise<void> {
        const schedules = await this.scheduleRepository.find({
            where: { isActive: true },
        });

        const schedulesToDelete = new Set(this.jobs.keys());
        const counters = { created: 0, updated: 0, deleted: 0, unchanged: 0 };

        for (const schedule of schedules) {
            try {
                schedulesToDelete.delete(schedule.id);

                const cron = this.convertToCron(schedule);
                const existingJob = this.jobs.get(schedule.id);

                if (existingJob) {
                    if (existingJob.cron === cron) {
                        counters.unchanged++;
                        continue;
                    }

                    this.logger.log(
                        `Schedule ${schedule.id} changed: ${existingJob.cron} → ${cron}`,
                    );
                    existingJob.job.stop();
                    counters.updated++;
                } else {
                    counters.created++;
                }

                this.logger.log(
                    `Creating schedule ${schedule.id} for document ${schedule.documentId}: ${cron}`,
                );

                const job = CronJob.from({
                    cronTime: cron,
                    onTick: () => this.executeSchedule(schedule),
                    start: true,
                    timeZone: schedule.timezone,
                    context: schedule.documentId,
                });

                this.jobs.set(schedule.id, { job, cron });
            } catch (err) {
                this.logger.error(`Failed to sync schedule ${schedule.id}`, err);
            }
        }

        for (const scheduleId of schedulesToDelete) {
            this.logger.log(`Removing schedule ${scheduleId}`);
            this.jobs.get(scheduleId)?.job.stop();
            this.jobs.delete(scheduleId);
            counters.deleted++;
        }

        if (counters.created > 0 || counters.updated > 0 || counters.deleted > 0) {
            this.logger.log(
                `Schedules synced - created: ${counters.created}, updated: ${counters.updated}, deleted: ${counters.deleted}, unchanged: ${counters.unchanged}`,
            );
        }
    }

    private executeSchedule(schedule: ExecutionScheduleEntity): Promise<void> {
        const promise = this.executeScheduleInternal(schedule)
            .then(() => {
                this.running.delete(schedule.id);
            })
            .catch((err) => {
                this.running.delete(schedule.id);
                this.logger.error(`Failed to execute schedule ${schedule.id}`, err);
            });

        this.running.set(schedule.id, promise);
        return promise;
    }

    private async executeScheduleInternal(
        schedule: ExecutionScheduleEntity,
    ): Promise<void> {
        this.logger.log(
            `Starting execution for document ${schedule.documentId}`,
        );

        await this.scheduleRepository.update(schedule.id, {
            lastExecutedAt: new Date(),
        });

        const document = await this.documentRepository.findOne({
            where: { id: schedule.documentId },
        });

        if (!document) {
            this.logger.warn(
                `Document ${schedule.documentId} not found, skipping execution`,
            );
            return;
        }

        if (document.deletedAt !== null) {
            this.logger.log(
                `Document ${schedule.documentId} is soft deleted, skipping execution`,
            );
            return;
        }

        try {
            await this.executeDocument(schedule, document);
            this.logger.log(`Finished execution for document ${schedule.documentId}`);
        } catch (err) {
            this.logger.error(
                `Failed execution for document ${schedule.documentId}`,
                err,
            );
        }
    }

    private async executeDocument(
        schedule: ExecutionScheduleEntity,
        document: DocumentEntity,
    ): Promise<void> {
        const yjsApp = await this.yjsAppRepository.findOne({
            where: { documentId: document.id },
            order: { createdAt: 'DESC' },
        });

        if (!yjsApp) {
            throw new Error(
                `No YjsAppDocument found for document ${document.id}`,
            );
        }

        await this.executeNotebook(schedule.id, document, yjsApp);
    }

    private async executeNotebook(
        scheduleId: string,
        document: DocumentEntity,
        yjsApp: YjsAppDocumentEntity,
    ): Promise<void> {
        // TODO: Integrate with Yjs service
        // Implementation should:
        // 1. Load Yjs document
        // 2. Create ExecutionQueue
        // 3. Run all blocks with scheduleId
        // 4. Wait for completion
        // 5. Update app state

        this.logger.warn(
            `Yjs execution not implemented for document ${document.id}`,
        );
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}