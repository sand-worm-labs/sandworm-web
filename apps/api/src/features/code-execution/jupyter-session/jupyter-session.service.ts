import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as services from '@jupyterlab/services';
import { decrypt } from '@sandworm/nest-common';
import { EnvironmentVariableEntity } from '@sandworm/postgresql-typeorm';
import { JupyterService } from '@/infrastructure/jupyter/jupyter.service';
import { AllConfigType } from '@/core/config/config.type';

export type Jupyter = {
    session: services.Session.ISessionConnection;
    kernel: services.Kernel.IKernelConnection;
};

@Injectable()
export class JupyterSessionService {
    private readonly sessions = new Map<string, Jupyter>();
    private readonly logger = new Logger(JupyterSessionService.name);

    constructor(
        @InjectRepository(EnvironmentVariableEntity)
        private readonly environmentVariableRepository: Repository<EnvironmentVariableEntity>,
        private readonly config: ConfigService<AllConfigType>,
        private readonly jupyterManager: JupyterService,
    ) { }

    async getSession(workspaceId: string, sessionId: string): Promise<Jupyter> {
        const key = `${workspaceId}-${sessionId}`;
        let jupyter = this.sessions.get(key);

        if (jupyter && jupyter.kernel.connectionStatus === 'connected') {
            return jupyter;
        }

        if (jupyter) {
            await this.disposeSession(key, jupyter);
        }

        jupyter = await this.withRetry(() => this.startNewSession(workspaceId, sessionId));
        this.sessions.set(key, jupyter);

        return jupyter;
    }

    private async startNewSession(workspaceId: string, sessionId: string): Promise<Jupyter> {
        const serverSettings = await this.getServerSettings(workspaceId);
        const kernelManager = new services.KernelManager({ serverSettings });
        const sessionManager = new services.SessionManager({
            kernelManager,
            serverSettings,
        });
        const session = await sessionManager.startNew({
            path: sessionId,
            name: sessionId,
            type: 'notebook',
            kernel: { name: 'python' },
        });

        if (!session.kernel) {
            throw new Error('session.kernel is null');
        }

        const encryptedVariables = await this.environmentVariableRepository.find({ where: { workspaceId } });
        const encryptionKey = this.config.get('database.environmentVariablesEncryptionKey', { infer: true });
        this.logger.debug({...encryptedVariables, encryptionKey});
        // const variables = encryptedVariables.map(v => ({
        //     name: decrypt(v.name, encryptionKey),
        //     value: decrypt(v.value, encryptionKey),
        // }));

        await this.setEnvironmentVariables(session.kernel, { add: [], remove: [] });

        return { session, kernel: session.kernel };
    }

    async cancelExecution(workspaceId: string, sessionId: string) {
        const { kernel } = await this.getSession(workspaceId, sessionId);
        await kernel.interrupt();
    }


    async disposeSession(key: string, jupyter: Jupyter) {
        try {
            await jupyter.session.shutdown();
            await jupyter.kernel.shutdown();
            jupyter.session.dispose();
            jupyter.kernel.dispose();
        } catch (err) {
            this.logger.error({ key, err }, 'Error disposing session');
        } finally {
            this.sessions.delete(key);
        }
    }

    async disposeAll(workspaceId: string) {
        const toDelete = Array.from(this.sessions.entries())
            .filter(([key]) => key.startsWith(workspaceId));

        for (const [key, jupyter] of toDelete) {
            await this.disposeSession(key, jupyter);
        }
    }

    async setEnvironmentVariables(
        kernel: services.Kernel.IKernelConnection,
        variables: { add: { name: string; value: string }[]; remove: string[] }
    ) {
        const code = [
            'import os',
            ...variables.remove.map(v => `os.environ.pop('${v}', None)`),
            ...variables.add.map(v => `os.environ['${v.name}'] = '${v.value}'`),
        ].join('\n');

        await kernel.requestExecute({ code, store_history: false }).done;
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

    private async withRetry<T>(fn: () => Promise<T>, maxRetries = 5): Promise<T> {
        let attempt = 0;
        while (true) {
            try {
                return await fn();
            } catch (err) {
                if (++attempt >= maxRetries) throw err;
                this.logger.warn({ attempt, err }, 'Retrying');
                await new Promise(res => setTimeout(res, 2 ** attempt * 1000));
            }
        }
    }

    private async getServerSettings(_workspaceId: string) {
        const serverSettings = await this.jupyterManager.getServerSettings();
        return serverSettings;
    }
}
