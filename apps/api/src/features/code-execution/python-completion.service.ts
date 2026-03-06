import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server, Socket } from 'socket.io';
import { uuid, z } from 'zod';
import { PythonSuggestion, PythonSuggestionsResult } from '@sandworm/types';
import { getDocumentSourceWithBlockStartPos } from '@sandworm/editor';
import { YjsDocumentService } from '@/features/collaboration/yjs/yjs-document.service';
import { PersistorFactory } from '@/features/collaboration/yjs/persistors/persistor.factory';
import { JupyterCompletionService } from '@/features/code-execution/jupyter-session/jupyter-completion.service';
import { DocumentEntity } from '@sandworm/postgresql-typeorm';
import { randomUUID } from 'crypto';
import { Session } from '../auth/core/types/session.type';

const CompletionRequestSchema = z.object({
    documentId: z.string().uuid(),
    blockId: z.string(),
    position: z.number().int().min(0),
});

const JupyterMetadataSchema = z.object({
    _jupyter_types_experimental: z.array(z.record(z.string(), z.unknown())),
});

type CompletionRequest = z.infer<typeof CompletionRequestSchema>;

@Injectable()
export class PythonCompletionService {
    private readonly logger = new Logger(PythonCompletionService.name);

    constructor(
        @InjectRepository(DocumentEntity)
        private readonly documentRepository: Repository<DocumentEntity>,
        private readonly yjsDocumentService: YjsDocumentService,
        private readonly persistorFactory: PersistorFactory,
        private readonly jupyterCompletionService: JupyterCompletionService,
    ) { }

    async completePython(
        server: Server,
        client: Socket,
        data: unknown,
        session: Session,
    ): Promise<PythonSuggestionsResult> {
        // Validate request
        const parsedData = CompletionRequestSchema.safeParse(data);
        if (!parsedData.success) {
            this.logger.warn('Invalid completion request payload', parsedData.error);
            return { status: 'invalid-payload' };
        }

        const { blockId, documentId, position } = parsedData.data;

        try {
            // Validate document and permissions
            const document = await this.validateDocumentAccess(documentId, session, client);
            if (!document) {
                return { status: 'invalid-payload' };
            }

            // Get completion
            return await this.getCompletion(server, document, blockId, position);
        } catch (err) {
            this.logger.error(
                `Failed to get Python completion for document ${documentId}, block ${blockId}`,
                err instanceof Error ? err.stack : String(err),
            );
            return { status: 'unexpected-error' };
        }
    }

    private async validateDocumentAccess(
        documentId: string,
        session: Session,
        client: Socket,
    ): Promise<DocumentEntity | null> {
        const document = await this.documentRepository.findOne({
            where: { id: documentId },
            select: ['id', 'workspaceId'],
        });

        if (!document) {
            this.logger.warn(`Document ${documentId} not found`);
            client.disconnect(true);
            return null;
        }

        const userWorkspace = session.userWorkspaces?.[document.workspaceId];
        if (!userWorkspace) {
            this.logger.warn(
                `User ${session.user.id} does not have access to workspace ${document.workspaceId}`,
            );
            client.disconnect(true);
            return null;
        }

        if (userWorkspace.role === 'viewer') {
            this.logger.warn(
                `User ${session.user.id} attempted completion as viewer in workspace ${document.workspaceId}`,
            );
            client.disconnect(true);
            return null;
        }

        return document;
    }

    private async getCompletion(
        server: Server,
        document: DocumentEntity,
        blockId: string,
        position: number,
    ): Promise<PythonSuggestionsResult> {
        const persistor = this.persistorFactory.createDocumentPersistor(document.id);
        let id = randomUUID().toString();

        return await this.yjsDocumentService.getYDocForUpdate(
            id,
            document.id,
            server,
            document.workspaceId,
            async (yDoc) => {
                // Extract source code and calculate absolute position
                const { source, blockStartPos } = getDocumentSourceWithBlockStartPos(
                    yDoc.ydoc,
                    blockId,
                );
                const absolutePosition = blockStartPos + position;

                // Get completion from Jupyter
                const completion = await this.jupyterCompletionService.getCompletion(
                    document.workspaceId,
                    document.id,
                    source,
                    absolutePosition,
                );

                return this.parseCompletionResult(completion, document.id, blockId);
            },
            persistor,
        );
    }

    private parseCompletionResult(
        completion: any,
        documentId: string,
        blockId: string,
    ): PythonSuggestionsResult {
        // Handle abort status
        if (completion.content?.status === 'abort') {
            this.logger.debug(`Completion aborted for document ${documentId}, block ${blockId}`);
            return { status: 'success', suggestions: [] };
        }

        // Handle error status
        if (completion.content?.status === 'error') {
            this.logger.error('Jupyter completion error', {
                documentId,
                blockId,
                ename: completion.content.ename,
                evalue: completion.content.evalue,
                traceback: completion.content.traceback,
            });
            return { status: 'unexpected-error' };
        }

        // Parse successful completion
        try {
            const suggestions = this.extractSuggestions(completion);
            return { status: 'success', suggestions };
        } catch (err) {
            this.logger.error('Failed to parse completion result', err);
            return { status: 'unexpected-error' };
        }
    }

    private extractSuggestions(completion: any): PythonSuggestion[] {
        const suggestions: PythonSuggestion[] = [];
        const matches = new Set<string>(completion.content.matches || []);

        // Extract typed suggestions from metadata
        const metadata = JupyterMetadataSchema.safeParse(completion.content.metadata);

        if (metadata.success) {
            for (const rawSuggestion of metadata.data._jupyter_types_experimental) {
                const parsed = PythonSuggestion.safeParse(rawSuggestion);
                if (parsed.success) {
                    suggestions.push(parsed.data);
                    matches.delete(parsed.data.text);
                }
            }
        }

        // Add remaining matches as text-only suggestions
        const cursorStart = completion.content.cursor_start;
        const cursorEnd = completion.content.cursor_end;

        for (const match of matches) {
            suggestions.push({
                start: cursorStart,
                end: cursorEnd,
                text: match,
                type: 'text',
                signature: '',
            });
        }

        return suggestions;
    }
}