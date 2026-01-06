import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { decrypt } from "@sandworm/nest-common";
import { EnvironmentVariableEntity } from '@sandworm/postgresql-typeorm';
import { PythonErrorOutput, Output } from '@sandworm/types';
import * as services from '@jupyterlab/services';
import { isDisplayDataMessage, isErrorMessage, isExecuteResultMessage, isStatusMessage, isStreamMessage } from './helpers/jupyter'
import { JupyterService } from '../jupyter/jupyter.service';
import { LockService } from '../lock/lock.service';

type Jupyter = {
    session: services.Session.ISessionConnection;
    kernel: services.Kernel.IKernelConnection;
};

type ExecutionController = {
    aborted: boolean;
    kernel: services.Kernel.IKernelConnection | null;
};

@Injectable()
export class PythonExecutorService {
    private readonly sessions = new Map<string, Jupyter>();
    private readonly logger = new Logger(PythonExecutorService.name);

    constructor(
        @InjectRepository(EnvironmentVariableEntity)
        private readonly environmentVariableRepository: Repository<EnvironmentVariableEntity>,
        private readonly config: ConfigService,
        private readonly jupyterManager: JupyterService,
        private readonly lockService: LockService,
    ) { }

    async executeCode(
        workspaceId: string,
        sessionId: string,
        code: string,
        onOutputs: (outputs: Output[]) => void,
        opts: { storeHistory: boolean }
    ) {
        const controller: ExecutionController = {
            aborted: false,
            kernel: null,
        };

        const promise = this.lockService.acquireLock(
            `executeCode:${workspaceId}:${sessionId}`,
            async () => {
                if (controller.aborted) {
                    this.logger.debug({ workspaceId, sessionId }, 'Execution aborted before starting');
                    return;
                }

                const { kernel } = await this.getSession(workspaceId, sessionId);
                controller.kernel = kernel;

                // Check again after getting kernel (in case abort was called during getSession)
                if (controller.aborted) {
                    this.logger.debug({ workspaceId, sessionId }, 'Execution aborted after getting kernel');
                    await kernel.interrupt();
                    return;
                }

                try {
                    await this.innerExecuteCode(workspaceId, sessionId, code, onOutputs, opts);
                } finally {
                    controller.kernel = null;
                }
            }
        );

        return {
            abort: async () => {
                if (controller.aborted) {
                    this.logger.debug({ workspaceId, sessionId }, 'Abort called multiple times, ignoring');
                    return;
                }

                controller.aborted = true;
                this.logger.log({ workspaceId, sessionId }, 'Aborting execution');

                if (controller.kernel) {
                    try {
                        await controller.kernel.interrupt();
                        await this.waitForKernelToBecomeIdle(
                            workspaceId,
                            sessionId,
                            controller.kernel,
                            'abortion'
                        );
                    } catch (err) {
                        this.logger.error({ workspaceId, sessionId, err }, 'Error during abort');
                    }
                }
            },
            promise,
        };
    }

    private async innerExecuteCode(
        workspaceId: string,
        sessionId: string,
        code: string,
        onOutputs: (outputs: Output[]) => void,
        { storeHistory }: { storeHistory: boolean }
    ): Promise<void> {
        this.logger.log({ workspaceId, sessionId }, 'Starting Jupyter for code execution.');

        await this.jupyterManager.ensureRunning(workspaceId);
        this.logger.log({ workspaceId, sessionId }, 'Jupyter is up.');

        const { kernel } = await this.getSession(workspaceId, sessionId);
        await this.waitForKernelToBecomeIdle(workspaceId, sessionId, kernel, 'execution');

        const future = kernel.requestExecute({
            code,
            allow_stdin: true,
            store_history: storeHistory
        });

        let kernelRestarted = false;
        const onKernelRestarted = (
            _: services.Kernel.IKernelConnection,
            status: services.Kernel.Status
        ) => {
            if (status === 'restarting' || status === 'autorestarting') {
                kernelRestarted = true;
            }
        };

        kernel.statusChanged.connect(onKernelRestarted);
        future.onIOPub = (message) => this.decodeIOPubMessage(message, onOutputs);

        this.logger.debug({ workspaceId, sessionId }, 'Waiting for code to execute');

        try {
            const idlePromise = this.waitForKernelIdle(kernel, workspaceId, sessionId);
            try {
                await Promise.race([future.done, idlePromise]);
            } finally {
                kernel.statusChanged.disconnect(onKernelRestarted);
            }
        } catch (err) {
            if (kernelRestarted) {
                onOutputs([{
                    type: 'error',
                    ename: 'KernelRestarted',
                    evalue: 'Kernel restarted during execution. Ran out of memory.',
                    traceback: [],
                }]);
                return;
            }
            throw err;
        }

        this.logger.debug({ workspaceId, sessionId }, 'Code finished executing');
    }

    private waitForKernelIdle(
        kernel: services.Kernel.IKernelConnection,
        workspaceId: string,
        sessionId: string,
        timeoutMs: number = 60000
    ): Promise<void> {
        return new Promise<void>((resolve) => {
            let timeout: NodeJS.Timeout | null = null;
            let done = false;
            let status = kernel.status;

            this.logger.log({ workspaceId, sessionId, status }, 'Waiting for kernel to become idle');

            const onStatusChanged = (
                _: services.Kernel.IKernelConnection,
                newStatus: services.Kernel.Status
            ) => {
                if (done || status === newStatus) return;

                this.logger.log({ workspaceId, sessionId, status: newStatus }, 'Kernel status changed');

                if (timeout) {
                    this.logger.log({ workspaceId, sessionId, status, newStatus }, 'Clearing timeout');
                    clearTimeout(timeout);
                    timeout = null;
                }

                if (newStatus === 'idle') {
                    this.logger.log({ workspaceId, sessionId, status, newStatus }, 'Setting timeout');
                    timeout = setTimeout(() => {
                        if (!done) {
                            this.logger.log({ workspaceId, sessionId, status, newStatus }, 'Timeout reached');
                            done = true;
                            kernel.statusChanged.disconnect(onStatusChanged);
                            resolve();
                        }
                    }, timeoutMs);
                }
                status = newStatus;
            };

            kernel.statusChanged.connect(onStatusChanged);

            if (status === 'idle') {
                this.logger.log({ workspaceId, sessionId, status }, 'Initial idle status, setting timeout');
                timeout = setTimeout(() => {
                    if (!done) {
                        done = true;
                        kernel.statusChanged.disconnect(onStatusChanged);
                        resolve();
                    }
                }, timeoutMs);
            }
        });
    }

    private decodeIOPubMessage(
        message: services.KernelMessage.IIOPubMessage,
        onOutputs: (outputs: Output[]) => void
    ): void {
        if (isStatusMessage(message)) {
            const { execution_state } = message.content;
            if (execution_state !== 'idle' && execution_state !== 'busy') {
                this.logger.warn({ execution_state }, 'Unexpected execution_state');
            }
            return;
        }

        if (isStreamMessage(message)) {
            onOutputs([{
                type: 'stdio',
                name: message.content.name,
                text: message.content.text,
            }]);
            return;
        }

        if (isExecuteResultMessage(message) || isDisplayDataMessage(message)) {
            const data = message.content.data;

            const plotly = data['application/vnd.plotly.v1+json'] as any;
            if (plotly?.data) {
                onOutputs([{
                    type: 'plotly',
                    data: plotly.data,
                    layout: plotly.layout,
                    frames: plotly.frames,
                }]);
                return;
            }

            if (typeof data['image/png'] === 'string') {
                onOutputs([{ type: 'image', data: data['image/png'], format: 'png' }]);
                return;
            }

            if (typeof data['text/html'] === 'string') {
                onOutputs([{ type: 'html', html: data['text/html'] }]);
                return;
            }

            if (typeof data['text/plain'] === 'string') {
                onOutputs([{ type: 'stdio', name: 'stdout', text: data['text/plain'] }]);
                return;
            }

            this.logger.warn({ mimeTypes: Object.keys(data) }, 'Unsupported display data');
            return;
        }

        if (isErrorMessage(message)) {
            onOutputs([{
                type: 'error',
                ename: message.content.ename,
                evalue: message.content.evalue,
                traceback: message.content.traceback ?? [],
            }]);
            return;
        }

        if (message.header.msg_type !== 'execute_input') {
            this.logger.warn({ msgType: message.header.msg_type }, 'Got unsupported message type');
        }
    }

    public async renderJinja(
        workspaceId: string,
        sessionId: string,
        template: string
    ): Promise<string | PythonErrorOutput> {
        const code = `
def _sandworm_render_template():
  from jinja2 import Template
  import json
  result = json.dumps({"type": "success", "result": Template(${JSON.stringify(template)}).render(**globals())})
  print(result)

_sandworm_render_template()
del _sandworm_render_template`;

        let result: string | PythonErrorOutput | null = null;
        const { promise } = await this.executeCode(
            workspaceId,
            sessionId,
            code,
            (outputs) => {
                for (const output of outputs) {
                    if (output.type === 'stdio' && output.name === 'stdout') {
                        const lines = output.text.trim().split('\n');
                        for (const line of lines) {
                            const parsed = JSON.parse(line.trim());
                            if (parsed.type === 'success') {
                                result = parsed.result;
                            } else {
                                throw new Error('Unexpected output: ' + line);
                            }
                        }
                    } else if (output.type === 'error') {
                        result = {
                            type: 'error',
                            ename: output.ename,
                            evalue: output.evalue,
                            traceback: output.traceback,
                        };
                    }
                }
            },
            { storeHistory: false }
        );
        await promise;

        if (!result) {
            throw new Error('Got no result from rendering template');
        }

        return result;
    }

    async cancelExecution(workspaceId: string, sessionId: string) {
        const { kernel } = await this.getSession(workspaceId, sessionId);
        await kernel.interrupt();
    }

    async getCompletion(
        workspaceId: string,
        sessionId: string,
        code: string,
        position: number
    ) {
        await this.jupyterManager.ensureRunning(workspaceId);
        const { kernel } = await this.getSession(workspaceId, sessionId);

        return kernel.requestComplete({
            code,
            cursor_pos: position,
        });
    }

    async updateEnvironmentVariables(
        workspaceId: string,
        variables: { add: { name: string; value: string }[]; remove: string[] }
    ) {
        await Promise.all(
            Array.from(this.sessions.entries()).map(async ([key, { kernel }]) => {
                if (key.startsWith(workspaceId)) {
                    await this.setEnvironmentVariables(kernel, variables);
                }
            })
        );
    }

    async disposeAll(workspaceId: string) {
        const keysToDelete: string[] = [];

        await Promise.all(
            Array.from(this.sessions.entries()).map(async ([key, { kernel, session }]) => {
                if (key.startsWith(workspaceId)) {
                    keysToDelete.push(key);
                    try {
                        await session.shutdown();
                        await kernel.shutdown();
                        session.dispose();
                        kernel.dispose();
                    } catch (err) {
                        this.logger.error({ workspaceId, key, err }, 'Error disposing session');
                    }
                }
            })
        );

        keysToDelete.forEach(key => this.sessions.delete(key));
    }

    private escapePythonString(str: string): string {
        return str
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
    }

    private async setEnvironmentVariables(
        kernel: services.Kernel.IKernelConnection,
        variables: { add: { name: string; value: string }[]; remove: string[] }
    ) {
        const code = ['import os']
            .concat(variables.remove.map((v) => `os.environ.pop('${this.escapePythonString(v)}', None)`))
            .concat(variables.add.map((v) => `os.environ['${this.escapePythonString(v.name)}'] = '${this.escapePythonString(v.value)}'`))
            .join('\n');

        await kernel.requestExecute({
            code,
            store_history: false,
        }).done;
    }

    private async startNewSession(
        sessionManager: services.SessionManager,
        workspaceId: string,
        sessionId: string
    ) {
        const session = await sessionManager.startNew({
            path: sessionId,
            type: 'notebook',
            name: sessionId,
            kernel: {
                name: 'python',
            },
        });

        if (!session.kernel) {
            throw new Error('session.kernel is null');
        }

        const encryptedVariables = await this.environmentVariableRepository.find({
            where: { workspaceId },
        });

        const encryptionKey = this.config.get<string>('ENVIRONMENT_VARIABLES_ENCRYPTION_KEY');
        const variables = encryptedVariables.map((v) => ({
            name: decrypt(v.name, encryptionKey),
            value: decrypt(v.value, encryptionKey),
        }));

        await this.setEnvironmentVariables(session.kernel, {
            add: variables,
            remove: [],
        });

        return session;
    }

    private async getSession(workspaceId: string, sessionId: string): Promise<Jupyter> {
        const key = `${workspaceId}-${sessionId}`;
        let jupyter = this.sessions.get(key);

        if (jupyter) {
            if (jupyter.kernel.connectionStatus === 'connected') {
                return jupyter;
            }

            jupyter.kernel.dispose();
            jupyter.session.dispose();
            this.sessions.delete(key);
        }

        const { sessionManager } = await this.getManager(workspaceId);
        const sessionModel = await sessionManager.findByPath(sessionId);

        const session = sessionModel
            ? sessionManager.connectTo({ model: sessionModel })
            : await this.withRetry(() =>
                this.startNewSession(sessionManager, workspaceId, sessionId)
            );

        if (!session.kernel) {
            throw new Error('session.kernel is null');
        }

        jupyter = { session, kernel: session.kernel };
        this.sessions.set(key, jupyter);
        return jupyter;
    }

    private async getManager(workspaceId: string) {
        const serverSettings = await this.jupyterManager.getServerSettings(workspaceId);
        const kernelManager = new services.KernelManager({ serverSettings });
        const sessionManager = new services.SessionManager({
            kernelManager,
            serverSettings,
        });

        return { kernelManager, sessionManager };
    }

    private async withRetry<T>(
        fn: () => Promise<T>,
        maxRetries = 5,
        maxTimeout = 15000
    ): Promise<T> {
        let attempt = 1;
        while (attempt <= maxRetries) {
            try {
                return await fn();
            } catch (err) {
                if (attempt === maxRetries) {
                    throw err;
                }

                this.logger.warn({ attempt, err }, 'Retrying');
                attempt++;
                await new Promise((resolve) =>
                    setTimeout(resolve, Math.min(2 ** attempt * 1000, maxTimeout))
                );
            }
        }

        return fn();
    }

    private async waitForKernelToBecomeIdle(
        workspaceId: string,
        sessionId: string,
        kernel: services.Kernel.IKernelConnection,
        reason: 'execution' | 'abortion'
    ) {
        const startTime = Date.now();

        let kernelStatus = kernel.status;
        const onStatusChanged = (
            _: services.Kernel.IKernelConnection,
            status: services.Kernel.Status
        ) => {
            kernelStatus = status;
        };

        kernel.statusChanged.connect(onStatusChanged);

        try {
            while (kernelStatus !== 'idle') {
                if (Date.now() - startTime > 60000) {
                    this.logger.error(
                        { workspaceId, sessionId, kernelStatus, reason },
                        'Spent more than 1 minute attempting to make the kernel be idle. Crashing.'
                    );
                    throw new Error('Failed to get an idle kernel');
                }

                if (Date.now() - startTime > 10000) {
                    this.logger.warn(
                        { workspaceId, sessionId, kernelStatus, reason },
                        'Spent more than 10 seconds trying to interrupt a non idle kernel. Restarting kernel instead.'
                    );
                    await kernel.restart();
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    continue;
                }

                this.logger.warn(
                    { workspaceId, sessionId, kernelStatus, reason },
                    reason === 'abortion'
                        ? 'Interrupting kernel because of abortion'
                        : 'Found non idle kernel before attempting to execute code. Interrupting first.'
                );
                await kernel.interrupt();
                await new Promise((resolve) => setTimeout(resolve, 500));
            }
        } finally {
            kernel.statusChanged.disconnect(onStatusChanged);
        }
    }
}