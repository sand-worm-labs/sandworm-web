import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as services from '@jupyterlab/services';
import { decrypt } from '@sandworm/nest-common';
import { EnvironmentVariableEntity } from '@sandworm/postgresql-typeorm';
import { JupyterService } from '@/infrastructure/jupyter/jupyter.service';
import { EnvironmentVariablesChangedEvent, EventNames, KernelRestartedEvent } from '@/events/environment.events';
import { AllConfigType } from '@/core/config/config.type';
import { buildTrinoConnectionUrl } from '@/features/code-execution/query-engine/trino/trino-connection-url.util';

// What an environment variable may be called, matching the environment page.
const ENV_VAR_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

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

        // The variables the workspace saved on its environment page (a Nansen or AvaCloud
        // key, say). The entity decrypts the values as it reads them. Never log these.
        const workspaceVariables = await this.environmentVariableRepository.find({ where: { workspaceId } });

        // Etherscan is the one key Sandworm supplies, because the calldata decoder tool
        // uses it. Every other key comes from the workspace, and a workspace's own
        // variable wins over ours, so it comes last.
        const etherscanApiKey = this.config.get('etherscan.apiKey', { infer: true });
        await this.setEnvironmentVariables(session.kernel, {
            add: [
                ...(etherscanApiKey ? [{ name: 'ETHERSCAN_API_KEY', value: etherscanApiKey }] : []),
                ...workspaceVariables.map(({ name, value }) => ({ name, value })),
            ],
            remove: [],
        });
        await session.kernel.requestExecute({ code: this.buildSessionPreamble(), store_history: false }).done;

        return { session, kernel: session.kernel };
    }

    // Defines _sandworm_query once per fresh kernel session so it's a real,
    // persistent global — usable from any cell in that session (a power-
    // toolbox block, a manually re-run cell, or a user's own code) — rather
    // than being re-injected as a prefix before each individual execution.
    // Namespaced rather than a bare `query` since the session persists
    // across blocks (storeHistory: true) and could otherwise collide with a
    // user's own variable of that name.
    //
    // datasource mirrors DATA_SOURCE_QUERY_ENGINE's split on the manual
    // SQL-block path: "trino" for a fresh pull against Dune's catalog,
    // "duckdb" to query a dataframe this session already loaded (e.g. a
    // variable another block put in scope) without round-tripping to Dune.
    // Defaults to "trino" since most tool templates are a first-touch pull.
    // The theme is applied here too, once, so every chart drawn in the session
    // gets Sandworm's colors and font with no import in the cell: power tools,
    // Python cells and AI-written cells alike. A chart that sets its own style
    // still wins; an image built without the package just skips it.
    private buildSessionPreamble(): string {
        return `
try:
    from sandworm_theme import use_theme as _sandworm_use_theme
    _sandworm_use_theme()
    del _sandworm_use_theme
except ImportError:
    pass

def _sandworm_query(sql, datasource="trino"):
    import pandas as pd

    if datasource == "duckdb":
        import duckdb
        result = duckdb.query(sql)
        return result.df() if result is not None else pd.DataFrame()

    if datasource != "trino":
        raise ValueError(f"Unknown datasource: {datasource!r} (expected 'trino' or 'duckdb')")

    from sqlalchemy import create_engine, text

    engine = create_engine(${JSON.stringify(buildTrinoConnectionUrl(this.config.getOrThrow('trino', { infer: true })))})
    try:
        with engine.connect() as conn:
            return pd.read_sql_query(text(sql), con=conn)
    finally:
        engine.dispose()
`;
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

    // A restart replaces the kernel's process but keeps its connection, so a cached
    // session would still look healthy while the setup its first run did (the
    // theme, _sandworm_query) is gone. Dropping it makes the next run start a fresh
    // session, which runs that setup again.
    @OnEvent(EventNames.KERNEL_RESTARTED)
    async onKernelRestarted({ workspaceId }: KernelRestartedEvent) {
        await this.disposeAll(workspaceId);
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
        // Names and values are user input, so they go in as string literals, never
        // pasted into the code: a value with a quote or a line break must not end the
        // string and run as Python. A JSON string is a valid Python string literal.
        const literal = (text: string) => JSON.stringify(text);
        const code = [
            'import os',
            ...variables.remove.filter(name => ENV_VAR_NAME.test(name)).map(name => `os.environ.pop(${literal(name)}, None)`),
            ...variables.add
                .filter(v => ENV_VAR_NAME.test(v.name))
                .map(v => `os.environ[${literal(v.name)}] = ${literal(v.value)}`),
        ].join('\n');

        await kernel.requestExecute({ code, store_history: false }).done;
    }

    // A variable saved or removed on the environment page reaches the workspace's
    // running kernels right away.
    @OnEvent(EventNames.ENVIRONMENT_VARIABLES_CHANGED)
    async onEnvironmentVariablesChanged({ workspaceId, add, remove }: EnvironmentVariablesChangedEvent) {
        await this.updateEnvironmentVariables(workspaceId, { add, remove });
    }

    async updateEnvironmentVariables(
        workspaceId: string,
        variables: { add: { name: string; value: string }[]; remove: string[] }
    ) {
        await Promise.all(
            Array.from(this.sessions.entries()).map(async ([key, { kernel }]) => {
                if (!key.startsWith(workspaceId)) return;
                try {
                    await this.setEnvironmentVariables(kernel, variables);
                } catch (err) {
                    // The variables are saved either way and the next session loads them.
                    // Only the key is logged: never the values.
                    this.logger.warn({ key, err }, 'Could not update the environment of a running kernel');
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
