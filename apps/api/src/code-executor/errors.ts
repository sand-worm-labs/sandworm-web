import { PythonErrorOutput } from '@sandworm/types';

export class PythonExecutionError extends Error {
    constructor(
        public etype: string,
        public ename: string,
        public evalue: string,
        public traceback: string[],
        message?: string
    ) {
        super(message ?? `${etype}: ${ename}: ${evalue}`)
        this.name = this.ename
    }

    public toPythonErrorOutput(): PythonErrorOutput {
        return {
            type: 'error',
            ename: this.ename,
            evalue: this.evalue,
            traceback: this.traceback,
        }
    }
}

export class PythonStderrError extends Error {
    constructor(
        public readonly workspaceId: string,
        public readonly sessionId: string,
        public readonly text: string,
        message?: string
    ) {
        super(
            message ??
            `Got stderr while executing Python code in workspace "${workspaceId}" session "${sessionId}"`
        )
        this.name = 'PythonStderrError'
    }
}