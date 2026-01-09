import { Injectable, Logger } from '@nestjs/common';
import { Output, PythonErrorOutput } from '@sandworm/types';
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

    async renderJinja(
        workspaceId: string,
        sessionId: string,
        template: string,
    ): Promise<string | PythonErrorOutput> {

        const code = `
    from jinja2 import Template
    import json
    
    def _sandworm_render():
      try:
        result = Template(${JSON.stringify(template)}).render(**globals())
        print(json.dumps({"type": "success", "result": result}))
      except Exception as e:
        print(json.dumps({
          "type": "error",
          "ename": e.__class__.__name__,
          "evalue": str(e),
          "traceback": []
        }))
    
    _sandworm_render()
    del _sandworm_render
    `;

        let result: string | PythonErrorOutput | null = null;

        const { promise } = await this.executeCode(
            workspaceId,
            sessionId,
            code,
            (outputs) => {
                for (const output of outputs) {
                    if (output.type === 'stdio' && output.name === 'stdout') {
                        for (const line of output.text.trim().split('\n')) {
                            const parsed = JSON.parse(line);
                            result =
                                parsed.type === 'success'
                                    ? parsed.result
                                    : parsed;
                        }
                    }

                    if (output.type === 'error') {
                        result = {
                            type: 'error',
                            ename: output.ename,
                            evalue: output.evalue,
                            traceback: output.traceback,
                        };
                    }
                }
            },
            { storeHistory: false },
        );

        await promise;

        if (!result) {
            throw new Error('No result returned from Jinja render');
        }

        return result;
    }

}