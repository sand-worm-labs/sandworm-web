import { Injectable, Logger } from '@nestjs/common';
import { DateInputValue } from '@sandworm/editor';
import { Output } from '@sandworm/types';
import { PythonExecutorService } from './python-executor.service';

type DateType = 'date' | 'datetime';

interface DateTimeConfig {
    variable: string;
    value: DateInputValue;
    dateType: DateType;
}

interface VariableSetResult {
    promise: Promise<void>;
    abort: () => Promise<void>;
}

interface PythonError {
    type: 'error';
    ename: string;
    evalue: string;
    traceback: string[];
}

@Injectable()
export class VariableService {
    private readonly logger = new Logger(VariableService.name);

    constructor(
        private readonly executor: PythonExecutorService,
        private readonly workspaceId: string,
        private readonly sessionId: string
    ) { }

    async setVariable(variable: string, value: string): Promise<VariableSetResult> {
        const code = this.buildVariableAssignment(variable, value);

        return this.executor.executeCode(code, this.noOpOutputHandler, {
            storeHistory: false,
        });
    }

    async setDateTimeVariable(config: DateTimeConfig): Promise<void> {
        const code = this.buildDateTimeCode(config);
        const errorCollector = this.createErrorCollector();

        await this.executor
            .executeCode(
                code,
                (outputs) => errorCollector.collect(outputs, config),
                { storeHistory: false }
            )
            .then(({ promise }) => promise);

        errorCollector.throwIfError();
    }

    private noOpOutputHandler = (): void => { };

    private createErrorCollector() {
        let capturedError: Error | null = null;

        return {
            collect: (outputs: Output[], config: DateTimeConfig) => {
                const error = this.extractError(outputs, config);
                if (error) capturedError = error;
            },
            throwIfError: () => {
                if (capturedError) throw capturedError;
            },
        };
    }

    private buildVariableAssignment(variable: string, value: string): string {
        return `${variable} = ${JSON.stringify(value)}`;
    }

    private buildDateTimeCode(config: DateTimeConfig): string {
        const { variable, value, dateType } = config;

        const codeGenerators: Record<DateType, () => string> = {
            date: () => this.buildDateCode(variable, value),
            datetime: () => this.buildDatetimeCode(variable, value),
        };

        return codeGenerators[dateType]();
    }

    private buildDateCode(variable: string, value: DateInputValue): string {
        const { year, month, day } = value;

        return `from datetime import date
${variable} = date(${year}, ${month}, ${day})`;
    }

    private buildDatetimeCode(variable: string, value: DateInputValue): string {
        const { year, month, day, hours, minutes, seconds, timezone } = value;

        return `import pytz
from datetime import datetime
${variable} = pytz.timezone('${timezone}').localize(
    datetime(${year}, ${month}, ${day}, ${hours}, ${minutes}, ${seconds})
)`;
    }

    private extractError(outputs: Output[], config: DateTimeConfig): Error | null {
        for (const output of outputs) {
            if (this.isErrorOutput(output)) {
                this.logError(output, config);
                return new Error(`${output.ename}: ${output.evalue}`);
            }
        }

        return null;
    }

    private isErrorOutput(output: Output): output is PythonError {
        return output.type === 'error';
    }

    private logError(error: PythonError, config: DateTimeConfig): void {
        this.logger.error(
            {
                pythonError: error,
                workspaceId: this.workspaceId,
                sessionId: this.sessionId,
                variable: config.variable,
                value: config.value,
            },
            'Failed to set datetime variable'
        );
    }
}