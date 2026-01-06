import { JupyterService } from "../../jupyter/jupyter.service";
import { JupyterSessionService } from "./jupyter-session.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PythonCompletionService {
    constructor(
        private readonly jupyterManager: JupyterService,
        private readonly sessionService: JupyterSessionService,
    ) { }

    async getCompletion(
        workspaceId: string,
        sessionId: string,
        code: string,
        position: number
    ) {
        await this.jupyterManager.ensureRunning(workspaceId);

        const { kernel } = await this.sessionService.getSession(
            workspaceId,
            sessionId
        );

        return kernel.requestComplete({
            code,
            cursor_pos: position,
        });
    }
}
