import { Logger } from '@nestjs/common'
import { DateInputValue } from '@sandworm/editor'
import { Output } from '@sandworm/types'
import { PythonExecutorService } from './python-executor.service'

type DateType = 'date' | 'datetime'

interface DateTimeConfig {
    variable: string
    value: DateInputValue
    dateType: DateType
}

interface VariableSetResult {
    promise: Promise<void>
    abort: () => Promise<void>
}

export class VariableService {
    private readonly logger = new Logger(VariableService.name)
    private readonly executor: PythonExecutorService;

    constructor(
        private readonly workspaceId: string,
        private readonly sessionId: string
    ) { }


    async setVariable(
        variable: string,
        value: string
    ): Promise<VariableSetResult> {
        const code = this.generateVariableCode(variable, value)

        return this.executor.executeCode(
            this.workspaceId,
            this.sessionId,
            code,
            () => { },
            { storeHistory: false }
        )
    }


    async setDateTimeVariable(config: DateTimeConfig): Promise<void> {
        const code = this.generateDateTimeCode(config)
        let error: Error | null = null

        const { promise } = await this.executor.executeCode(
            this.workspaceId,
            this.sessionId,
            code,
            (outputs) => {
                error = this.handleDateTimeOutputs(outputs, config)
            },
            { storeHistory: false }
        )

        await promise

        if (error) {
            throw error
        }
    }


    private generateVariableCode(variable: string, value: string): string {
        return `${variable} = ${JSON.stringify(value)}`
    }


    private generateDateTimeCode(config: DateTimeConfig): string {
        const { variable, value, dateType } = config

        switch (dateType) {
            case 'date':
                return this.generateDateCode(variable, value)
            case 'datetime':
                return this.generateDatetimeCode(variable, value)
        }
    }


    private generateDateCode(variable: string, value: DateInputValue): string {
        return `from datetime import date
${variable} = date(${value.year}, ${value.month}, ${value.day})`
    }


    private generateDatetimeCode(
        variable: string,
        value: DateInputValue
    ): string {
        return `import pytz
from datetime import datetime
${variable} = pytz.timezone('${value.timezone}').localize(datetime(${value.year}, ${value.month}, ${value.day}, ${value.hours}, ${value.minutes}, ${value.seconds}))`
    }


    private handleDateTimeOutputs(
        outputs: Output[],
        config: DateTimeConfig
    ): Error | null {
        for (const output of outputs) {
            if (output.type === 'error') {
                this.logger.error(
                    {
                        pythonError: output,
                        workspaceId: this.workspaceId,
                        sessionId: this.sessionId,
                        variable: config.variable,
                        value: config.value,
                    },
                    'Error setting datetime variable'
                )

                return new Error(`${output.ename}: ${output.evalue}`)
            }
        }

        return null
    }
}