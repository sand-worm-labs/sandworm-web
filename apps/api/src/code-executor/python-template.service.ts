import { PythonErrorOutput } from "@sandworm/types";
import { PythonExecutorService } from "./python-executor.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PythonRenderService {
    constructor(
        private readonly executor: PythonExecutorService,
    ) { }

    async renderJinja(
        workspaceId: string,
        sessionId: string,
        template: string,
    ): Promise<string | PythonErrorOutput> {

        const code = `
from jinja2 import Template
import json

def _sandworm_render():
  try:
    result = Template(${JSON.stringify(template)}).render(**globals())
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
`;

        let result: string | PythonErrorOutput | null = null;

        const { promise } = await this.executor.executeCode(
            workspaceId,
            sessionId,
            code,
            (outputs) => {
                for (const output of outputs) {
                    if (output.type === 'stdio' && output.name === 'stdout') {
                        for (const line of output.text.trim().split('\n')) {
                            const parsed = JSON.parse(line);
                            result =
                                parsed.type === 'success'
                                    ? parsed.result
                                    : parsed;
                        }
                    }

                    if (output.type === 'error') {
                        result = {
                            type: 'error',
                            ename: output.ename,
                            evalue: output.evalue,
                            traceback: output.traceback,
                        };
                    }
                }
            },
            { storeHistory: false },
        );

        await promise;

        if (!result) {
            throw new Error('No result returned from Jinja render');
        }

        return result;
    }
}
