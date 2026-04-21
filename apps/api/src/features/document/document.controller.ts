import { JupyterService } from "@/infrastructure/jupyter/jupyter.service";
import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ApiAuth } from "@sandworm/api";
import  type { FastifyReply } from "fastify/types/reply";

@ApiTags('Documents')
@Controller({
    path: 'documents/:workspaceId/:documentId/queries',
})
export class DocumentController {

    constructor(
        private readonly jupyterService: JupyterService,
    ) {}

    @Get(':queryId/csv')
    @ApiAuth({ summary: 'Download query result as CSV' })
    async downloadCsv(
        @Param('workspaceId') workspaceId: string,
        @Param('documentId') documentId: string,
        @Param('queryId') queryId: string,
        @Query('name') name: string,
        @Res() reply: FastifyReply,
    ) {
        const filePath = `/home/sandwormuser/.sandworm/query-${queryId}.csv`;
        const result = await this.jupyterService.getFile(workspaceId, filePath);

        if (!result) {
            return reply.status(404).send({ message: 'Query result not found. Run the query first.' });
        }

        const fileName = `${name ?? queryId}.csv`;

        reply
            .header('Content-Disposition', `attachment; filename="${fileName}"`)
            .header('Content-Length', result.size)
            .header('Content-Type', 'text/csv');

        return reply.send(result.stream);
    }
}