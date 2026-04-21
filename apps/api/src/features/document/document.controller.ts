import { JupyterService } from "@/infrastructure/jupyter/jupyter.service";
import { Controller, Get, Logger, Param, Query, Res } from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { ApiAuth } from "@sandworm/api";
import  type { FastifyReply } from "fastify/types/reply";

@ApiTags('Documents')
@Controller({
    path: 'documents',
    version: '1',
})
export class DocumentQueryController {
    
    private readonly logger = new Logger(DocumentQueryController.name);
    constructor(
        private readonly jupyterService: JupyterService,
    ) {}

    @Get(':workspaceId/:documentId/queries/:queryId/csv')
    @ApiAuth({ summary: 'Download query result as CSV' })
    @ApiQuery({ name: 'name', required: false })
    async downloadCsv(
        @Param('workspaceId') workspaceId: string,
        @Param('documentId') documentId: string,
        @Param('queryId') queryId: string,
        @Query('name') name: string,
        @Res() reply: FastifyReply,
    ) {
        const filePath = `.sandworm/query-${queryId}.csv`;
        const result = await this.jupyterService.getFile(workspaceId, filePath);
        const data = await this.jupyterService.listFiles(workspaceId);
        this.logger.log( data);
        this.logger.log(filePath);

        if (!result) {
            return reply.status(500).send({ message: 'Query result not found. Run the query first.' });
        }

        const fileName = `${name ?? queryId}.csv`;

        reply
            .header('Content-Disposition', `attachment; filename="${fileName}"`)
            .header('Content-Length', result.size)
            .header('Content-Type', 'text/csv');

        return reply.send(result.stream);
    }
}