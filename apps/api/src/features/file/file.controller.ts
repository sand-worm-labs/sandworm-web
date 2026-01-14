import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Query,
    UploadedFile,
    UseInterceptors,
    Res,
    HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { ApiAuth } from '@sandworm/api/decorators/http.decorators';
import { FileService } from './file.service';
import { Readable } from 'stream';
import type { FastifyReply } from 'fastify';
import * as path from 'path';

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
     * 
     * IMPORTANT: Using Fastify instead of Express
     */
    @Get('file')
    @ApiAuth({
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

        // Fastify way of setting headers and streaming
        reply
            .header('Content-Disposition', `attachment; filename="${fileName}"`)
            .header('Content-Length', fileResult.size)
            .header('Content-Type', 'application/octet-stream')
            .type('application/octet-stream');

        // Send the stream using Fastify's reply.send()
        // Fastify automatically handles readable streams
        return reply.send(fileResult.stream);
    }

    /**
     * Upload a file
     * POST /v1/workspaces/:workspaceId/files?replace=true
     */
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    @ApiAuth({
        summary: 'Upload file to workspace',
        statusCode: 204,
    })
    async uploadFile(
        @Param('workspaceId') workspaceId: string,
        @Query('replace') replace: string,
        @UploadedFile() file: Express.Multer.File,
        @Res() reply: FastifyReply,
    ): Promise<void> {
        if (!file) {
            return reply.status(HttpStatus.BAD_REQUEST).send();
        }

        const fileStream = Readable.from(file.buffer);

        try {
            await this.fileService.uploadFile(
                workspaceId,
                file.originalname,
                replace === 'true',
                fileStream,
            );

            // Fastify way: reply.code() instead of res.sendStatus()
            return reply.code(HttpStatus.NO_CONTENT).send();
        } catch (error: any) {
            // 409 Conflict if file exists
            if (error.message === 'File already exists') {
                return reply.code(HttpStatus.CONFLICT).send();
            } else {
                throw error;
            }
        }
    }

    /**
     * Delete a file
     * DELETE /v1/workspaces/:workspaceId/files?path=/some/file.txt
     */
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
            throw new Error('File path is required');
        }

        await this.fileService.deleteFile({ workspaceId, path: filePath });
    }
}