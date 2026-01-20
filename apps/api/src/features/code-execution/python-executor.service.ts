import { Injectable, Logger } from '@nestjs/common';
import { Output, PythonErrorOutput } from '@sandworm/types';
import { JupyterSessionService } from './jupyter-session/jupyter-session.service';
import { KernelLifecycleService } from './jupyter-session/kernel-lifecycle.service';
import { decodeIOPubMessage } from './jupyter-session/iopub-decoder';

interface ExecutionHandle {
    abort: () => Promise<void>;
    promise: Promise<void>;
}

interface ExecutionOptions {
    storeHistory: boolean;
}

interface JinjaRenderResult {
    type: 'success';
    result: string;
}

interface JinjaRenderError {
    type: 'error';
    ename: string;
    evalue: string;
    traceback: string[];
}

type JinjaRenderOutput = JinjaRenderResult | JinjaRenderError;

@Injectable()
export class PythonExecutorService {
    private readonly logger = new Logger(PythonExecutorService.name);

    constructor(
        private readonly sessionService: JupyterSessionService,
        private readonly kernelLifecycle: KernelLifecycleService,
    ) { }

    async executeCode(
        context: { workspaceId: string; sessionId: string },
        code: string,
        onOutputs: (outputs: Output[]) => void,
        opts: ExecutionOptions = { storeHistory: true }
    ): Promise<ExecutionHandle> {
        const { kernel } = await this.sessionService.getSession(
            context.workspaceId,
            context.sessionId
        );

        const abortController = this.createAbortController();
        const promise = this.runExecution(
            context,
            kernel,
            code,
            onOutputs,
            opts,
            abortController
        );

        return {
            promise,
            abort: () => this.abortExecution(context, kernel, abortController),
        };
    }

    async renderJinja(context: { workspaceId: string; sessionId: string }, template: string): Promise<string | PythonErrorOutput> {
        const code = this.buildJinjaRenderCode(template);
        let result: string | PythonErrorOutput | null = null;

        const handleOutputs = (outputs: Output[]) => {
            result = this.extractJinjaResult(outputs, result);
        };

        await this.executeCode(context, code, handleOutputs, { storeHistory: false }).then(
            ({ promise }) => promise
        );

        if (result === null) {
            throw new Error('No result returned from Jinja render');
        }

        return result;
    }

    private createAbortController() {
        return { aborted: false };
    }

    private async abortExecution(
        context: { workspaceId: string; sessionId: string },
        kernel: any,
        controller: { aborted: boolean }
    ): Promise<void> {
        if (controller.aborted) return;

        controller.aborted = true;

        this.logger.warn(
            { workspaceId: context.workspaceId, sessionId: context.sessionId },
            'Execution aborted by user'
        );

        await this.kernelLifecycle.interrupt(kernel, 'user-abort');
    }

    private async runExecution(
        context: { workspaceId: string; sessionId: string },
        kernel: any,
        code: string,
        onOutputs: (outputs: Output[]) => void,
        opts: ExecutionOptions,
        abortController: { aborted: boolean }
    ): Promise<void> {
        await this.kernelLifecycle.ensureIdleOrRestart(kernel, 'before-execution');

        const future = kernel.requestExecute({
            code,
            allow_stdin: true,
            store_history: opts.storeHistory,
        });

        future.onIOPub = (msg: any) => decodeIOPubMessage(msg, onOutputs);

        try {
            await future.done;
        } catch (err) {
            if (!abortController.aborted) {
                this.logger.error(
                    { err, workspaceId: context.workspaceId, sessionId: context.sessionId },
                    'Code execution failed'
                );
                throw err;
            }
        }
    }

    private buildJinjaRenderCode(template: string): string {
        const escapedTemplate = JSON.stringify(template);

        return `
from jinja2 import Template
import json

def _sandworm_render():
    try:
        result = Template(${escapedTemplate}).render(**globals())
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
`.trim();
    }

    private extractJinjaResult(
        outputs: Output[],
        currentResult: string | PythonErrorOutput | null
    ): string | PythonErrorOutput | null {
        for (const output of outputs) {
            if (output.type === 'stdio' && output.name === 'stdout') {
                const parsed = this.parseJinjaOutput(output.text);
                if (parsed) {
                    return parsed.type === 'success' ? parsed.result : parsed;
                }
            }

            if (output.type === 'error') {
                return {
                    type: 'error',
                    ename: output.ename,
                    evalue: output.evalue,
                    traceback: output.traceback,
                };
            }
        }

        return currentResult;
    }

    private parseJinjaOutput(text: string): JinjaRenderOutput | null {
        try {
            const lines = text.trim().split('\n');

            for (const line of lines) {
                if (!line.trim()) continue;

                const parsed = JSON.parse(line) as JinjaRenderOutput;

                if (parsed.type === 'success' || parsed.type === 'error') {
                    return parsed;
                }
            }
        } catch (err) {
            this.logger.warn(
                { err, text },
                'Failed to parse Jinja render output'
            );
        }

        return null;
    }
}