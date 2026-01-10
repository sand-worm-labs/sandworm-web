import { Injectable, Logger } from '@nestjs/common';
import * as services from '@jupyterlab/services';

@Injectable()
export class KernelLifecycleService {
    private readonly logger = new Logger(KernelLifecycleService.name);

    async waitForIdle(
        kernel: services.Kernel.IKernelConnection,
        {
            timeoutMs = 60_000,
            reason = 'unknown',
        }: { timeoutMs?: number; reason?: string } = {}
    ): Promise<void> {
        const start = Date.now();
        let status = kernel.status;

        this.logger.debug({ status, reason }, 'Waiting for kernel to become idle');

        const onStatusChanged = (
            _: services.Kernel.IKernelConnection,
            newStatus: services.Kernel.Status
        ) => {
            status = newStatus;
        };

        kernel.statusChanged.connect(onStatusChanged);

        try {
            while (status !== 'idle') {
                const elapsed = Date.now() - start;

                if (elapsed > timeoutMs) {
                    this.logger.error(
                        { status, elapsed, reason },
                        'Kernel did not become idle in time'
                    );
                    throw new Error('Kernel idle timeout');
                }

                await this.sleep(250);
            }

            this.logger.debug({ reason }, 'Kernel is idle');
        } finally {
            kernel.statusChanged.disconnect(onStatusChanged);
        }
    }

    async interrupt(
        kernel: services.Kernel.IKernelConnection,
        reason = 'manual'
    ): Promise<void> {
        this.logger.warn({ reason }, 'Interrupting kernel');

        try {
            await kernel.interrupt();
            await this.waitForIdle(kernel, {
                timeoutMs: 15_000,
                reason: `interrupt:${reason}`,
            });
        } catch (err) {
            this.logger.error({ err }, 'Kernel interrupt failed');
            throw err;
        }
    }

    async restart(
        kernel: services.Kernel.IKernelConnection,
        reason = 'manual'
    ): Promise<void> {
        this.logger.warn({ reason }, 'Restarting kernel');

        try {
            await kernel.restart();
            await this.waitForIdle(kernel, {
                timeoutMs: 30_000,
                reason: `restart:${reason}`,
            });
        } catch (err) {
            this.logger.error({ err }, 'Kernel restart failed');
            throw err;
        }
    }

    async ensureIdleOrRestart(
        kernel: services.Kernel.IKernelConnection,
        reason = 'ensure-idle'
    ): Promise<void> {
        try {
            await this.waitForIdle(kernel, { timeoutMs: 10_000, reason });
        } catch {
            this.logger.warn({ reason }, 'Kernel stuck, restarting');
            await this.restart(kernel, reason);
        }
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}
