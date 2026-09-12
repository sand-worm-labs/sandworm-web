import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as services from '@jupyterlab/services';
import { decrypt } from '@sandworm/nest-common';
import { EnvironmentVariableEntity } from '@sandworm/postgresql-typeorm';
import { JupyterService } from '@/infrastructure/jupyter/jupyter.service';
import { AllConfigType } from '@/core/config/config.type';
import { TrinoQueryService } from '@/features/code-execution/query-engine/trino/trino-query.service';

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
        private readonly trinoQueryService: TrinoQueryService,
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
        await session.kernel.requestExecute({ code: this.buildQueryPreamble(), store_history: false }).done;

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
    private buildQueryPreamble(): string {
        return `
def _sandworm_query(sql, datasource="trino"):
    import pandas as pd

    if datasource == "duckdb":
        import duckdb
        result = duckdb.query(sql)
        return result.df() if result is not None else pd.DataFrame()

    if datasource != "trino":
        raise ValueError(f"Unknown datasource: {datasource!r} (expected 'trino' or 'duckdb')")

    from sqlalchemy import create_engine, text

    engine = create_engine(${JSON.stringify(this.trinoQueryService.buildConnectionUrl())})
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
