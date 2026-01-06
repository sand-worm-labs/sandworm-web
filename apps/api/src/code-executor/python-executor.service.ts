import { Injectable, Logger } from '@nestjs/common';
import { Output } from '@sandworm/types';
import { JupyterSessionService } from './jupyter/jupyter-session.service';
import { KernelLifecycleService } from './kernel/kernel-lifecycle.service';
import { decodeIOPubMessage } from './iopub-decoder';

type ExecutionHandle = {
    abort: () => Promise<void>;
    promise: Promise<void>;
};

@Injectable()
export class PythonExecutorService {
    private readonly logger = new Logger(PythonExecutorService.name);

    constructor(
        private readonly sessionService: JupyterSessionService,
        private readonly kernelLifecycle: KernelLifecycleService,
    ) { }

    async executeCode(
        workspaceId: string,
        sessionId: string,
        code: string,
        onOutputs: (outputs: Output[]) => void,
        opts: { storeHistory: boolean },
    ): Promise<ExecutionHandle> {
        const { kernel } = await this.sessionService.getSession(workspaceId, sessionId);

        let aborted = false;

        const promise = (async () => {
            await this.kernelLifecycle.ensureIdleOrRestart(
                kernel,
                'before-execution',
            );

            const future = kernel.requestExecute({
                code,
                allow_stdin: true,
                store_history: opts.storeHistory,
            });

            future.onIOPub = msg => decodeIOPubMessage(msg, onOutputs);

            try {
                await future.done;
            } catch (err) {
                if (!aborted) {
                    this.logger.error({ err }, 'Execution failed');
                    throw err;
                }
            }
        })();

        return {
            promise,
            abort: async () => {
                if (aborted) return;
                aborted = true;

                this.logger.warn({ workspaceId, sessionId }, 'Execution aborted');
                await this.kernelLifecycle.interrupt(kernel, 'user-abort');
            },
        };
    }

    private escapePythonString(str: string): string {
        return str
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
    }

}