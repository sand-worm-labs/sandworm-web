import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Query,
    Res,
    HttpStatus,
    HttpException,
    UseInterceptors,
    UploadedFile,
    Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiAuth, ApiPublic } from '@sandworm/api/decorators/http.decorators';
import { FileService } from './file.service';
import type { FastifyReply, FastifyRequest } from 'fastify';
import path from 'path';
import { Readable } from 'stream';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Files')
@Controller({
    path: 'workspaces/:workspaceId/files',
    version: '1',
})
export class FileController {
    constructor(private readonly fileService: FileService) { }

    /**
     * List all files in workspace
     * GET /v1/workspaces/:workspaceId/files
     */
    @Get()
    @ApiAuth({
        summary: 'List files in workspace',
    })
    async listFiles(@Param('workspaceId') workspaceId: string) {
        return this.fileService.listFiles({ workspaceId });
    }

    /**
     * Download a file
     * GET /v1/workspaces/:workspaceId/files/file?path=/some/file.txt
     */
    @Get('file')
    @ApiPublic({
        summary: 'Download file from workspace',
    })
    async downloadFile(
        @Param('workspaceId') workspaceId: string,
        @Query('path') filePath: string,
        @Res() reply: FastifyReply,
    ) {
        if (!filePath) {
            return reply.status(HttpStatus.BAD_REQUEST).send();
        }

        const fileResult = await this.fileService.getFile(workspaceId, filePath);

        if (!fileResult) {
            return reply.status(HttpStatus.NOT_FOUND).send();
        }

        const fileName = path.basename(filePath);

        reply
            .header('Content-Disposition', `attachment; filename="${fileName}"`)
            .header('Content-Length', fileResult.size)
            .type('application/octet-stream');

        return reply.send(fileResult.stream);
    }

    /**
     * Upload a file (multipart/form-data)
     * POST /v1/workspaces/:workspaceId/files?replace=true
     * Form field: 'file'
     */
    @UseInterceptors(FileInterceptor('file'))
    @Post()
    async uploadFile(
        @Param('workspaceId') workspaceId: string,
        @Query('replace') replace: string,
        @Req() req: FastifyRequest,
        @Res() reply: FastifyReply,
    ): Promise<void> {
        const buffer = req.body as Buffer;
        let filename = req.headers['x-file-name'] as string;
        console.log('Received upload request. Headers:', req.headers);
        if (!filename) {
            return reply.status(HttpStatus.BAD_REQUEST).send();
        }
        const fileStream = Readable.from(buffer);
        console.log('Uploading file:', filename, 'Replace:', replace);
        await this.fileService.uploadFile(
            workspaceId,
            filename,
            replace === 'true',
            fileStream,
        );
        return reply.code(HttpStatus.NO_CONTENT).send();
    }


    @Delete()
    @ApiAuth({
        summary: 'Delete file from workspace',
        statusCode: 204,
    })
    async deleteFile(
        @Param('workspaceId') workspaceId: string,
        @Query('path') filePath: string,
    ): Promise<void> {
        if (!filePath) {
            throw new HttpException('File path is required', HttpStatus.BAD_REQUEST);
        }

        await this.fileService.deleteFile({ workspaceId, path: filePath });
    }
}

