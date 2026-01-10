import { Injectable, Logger } from '@nestjs/common';
import { PythonExecutorService } from '../../python-executor.service';
import { JupyterService } from '@/infrastructure/jupyter/jupyter.service';
import { RunQueryResult, SuccessRunQueryResult } from '@sandworm/types';

interface ParseState {
    result: RunQueryResult | null;
    error: Error | null;
    aborted: boolean;
}

@Injectable()
export class PythonQueryRunnerService {

    private readonly logger = new Logger(PythonQueryRunnerService.name);
    constructor(
        private readonly pythonExecutor: PythonExecutorService,
        private readonly jupyter: JupyterService,
    ) { }

    async runQuery(
        workspaceId: string,
        sessionId: string,
        queryCode: string,
        loadCode: string,
        flagFilePath: string,
        onProgress: (result: SuccessRunQueryResult) => void,
    ): Promise<[Promise<RunQueryResult>, () => Promise<void>]> {
        const state = { result: null, error: null, aborted: false };
        const abortFns: (() => Promise<void>)[] = [];

        const { promise, abort } = await this.pythonExecutor.executeCode(
            workspaceId,
            sessionId,
            queryCode,
            (outputs) => this.parseQueryOutputs(outputs, state, onProgress),
            { storeHistory: false },
        );

        abortFns.push(abort);

        const resultPromise = promise.then(async () => {
            if (state.aborted) return { type: 'abort-error', message: 'Query aborted' };
            if (state.error) throw state.error;
            if (!state.result || state.result.type !== 'success') return state.result!;

            const { promise: loadPromise, abort: abortLoad } =
                await this.pythonExecutor.executeCode(
                    workspaceId,
                    sessionId,
                    loadCode,
                    () => { },
                    { storeHistory: false },
                );

            abortFns.push(abortLoad);
            await loadPromise;
            return state.result;
        });

        const abortFn = async () => {
            state.aborted = true;
            await this.jupyter.deleteFile(workspaceId, flagFilePath);
            await Promise.all(abortFns.map((f) => f()));
        };

        return [resultPromise, abortFn];
    }

    parseQueryOutputs(
        outputs: any[],
        state: ParseState,
        onProgress: (r: SuccessRunQueryResult) => void,
    ) {
        for (const output of outputs) {
            if (output.type === 'stdio' && output.name === 'stdout') {
                for (const line of output.text.trim().split('\n')) {
                    try {
                        const parsed = JSON.parse(line);
                        if (parsed.type === 'success') {
                            state.result = parsed;
                            onProgress(parsed);
                        } else if (parsed.type === 'syntax-error') {
                            state.result = parsed;
                        }
                    } catch { }
                }
            }

            if (output.type === 'error') {
                state.result = {
                    type: 'python-error',
                    ename: output.ename,
                    evalue: output.evalue,
                    traceback: output.traceback,
                };
            }
        }
    }
}
