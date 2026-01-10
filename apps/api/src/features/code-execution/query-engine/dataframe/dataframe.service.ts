import { Injectable } from '@nestjs/common';
import { PythonExecutorService } from '../../python-executor.service';
import { DataFrame } from '@sandworm/types';

@Injectable()
export class DataFrameService {
    constructor(private readonly pythonExecutor: PythonExecutorService) { }
    async rename(
        from: string,
        to: string,
    ) {
        const code = `if "${from}" in globals():
    ${to} = ${from}
    del ${from}`;
        await (
            await this.pythonExecutor.executeCode(
                code,
                () => { },
                { storeHistory: false },
            )
        ).promise;
    }

    async list(
    ): Promise<DataFrame[]> {
        const code = `
            import pandas as pd, json
            dfs = []
            for k,v in globals().items():
                if isinstance(v, pd.DataFrame):
                    dfs.append({"name": k})
            print(json.dumps(dfs))
        `;
        let result: DataFrame[] = [];

        await (
            await this.pythonExecutor.executeCode(
                code,
                (outputs) => {
                    for (const o of outputs) {
                        if (o.type === 'stdio') {
                            result = JSON.parse(o.text);
                        }
                    }
                },
                { storeHistory: false },
            )
        ).promise;

        return result;
    }
}
