import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server, Socket } from 'socket.io';
import { z } from 'zod';
import { PythonSuggestion, PythonSuggestionsResult } from '@sandworm/types';
import { getDocumentSourceWithBlockStartPos } from '@sandworm/editor';
import { Session } from '@/features/session/domain/session';
import { YjsDocumentService } from '@/features/collaboration/yjs/yjs-document.service';
import { PersistorFactory } from '@/features/collaboration/yjs/persistors/persistor.factory';
import { JupyterCompletionService } from '@/features/code-execution/jupyter-session/jupyter-completion.service';
import { DocumentEntity } from '@sandworm/postgresql-typeorm';

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
        const parsedData = z
            .object({
                documentId: z.string(),
                blockId: z.string(),
                position: z.number(),
            })
            .safeParse(data);

        if (!parsedData.success) {
            return { status: 'invalid-payload' };
        }

        const { blockId, documentId, position } = parsedData.data;

        try {
            const doc = await this.documentRepository.findOne({
                where: { id: documentId },
                select: ['id', 'workspaceId'],
            });

            if (!doc) {
                client.disconnect(true);
                return { status: 'invalid-payload' };
            }

            const userWorkspace = session.userWorkspaces?.[doc.workspaceId];
            if (!userWorkspace || userWorkspace.role === 'viewer') {
                client.disconnect(true);
                return { status: 'invalid-payload' };
            }

            // Create persistor using factory
            const persistor = this.persistorFactory.createDocumentPersistor(documentId);

            // Get YDoc and compute completion
            const result = await this.yjsDocumentService.getYDocForUpdate(
                documentId,
                server,
                doc.id,
                doc.workspaceId,
                async (yDoc) => {
                    const { source, blockStartPos } = getDocumentSourceWithBlockStartPos(
                        yDoc.ydoc,
                        blockId,
                    );
                    const finalPosition = blockStartPos + position;

                    const completion = await this.jupyterCompletionService.getCompletion(
                        doc.workspaceId,
                        doc.id,
                        source,
                        finalPosition,
                    );

                    return this.parseCompletionResult(completion, documentId, blockId);
                },
                persistor,
            );

            return result;
        } catch (err) {
            this.logger.error(
                `Failed to get Python completion for document ${documentId}, block ${blockId}`,
                err instanceof Error ? err.stack : err,
            );
            return { status: 'unexpected-error' };
        }
    }

    private parseCompletionResult(
        completion: any,
        documentId: string,
        blockId: string,
    ): PythonSuggestionsResult {
        if (completion.content.status === 'abort') {
            return { status: 'success', suggestions: [] };
        }

        if (completion.content.status === 'error') {
            this.logger.error({
                documentId,
                blockId,
                ename: completion.content.ename,
                evalue: completion.content.evalue,
                traceback: completion.content.traceback,
            });
            return { status: 'unexpected-error' };
        }

        const suggestions: PythonSuggestion[] = [];
        const matches = new Set(completion.content.matches);

        const metadata = z
            .object({
                _jupyter_types_experimental: z.array(z.record(z.string(), z.unknown())),
            })
            .safeParse(completion.content.metadata);

        if (metadata.success) {
            for (const rawSuggestion of metadata.data._jupyter_types_experimental) {
                const parsed = PythonSuggestion.safeParse(rawSuggestion);
                if (parsed.success) {
                    suggestions.push(parsed.data);
                    matches.delete(parsed.data.text);
                }
            }
        }

        for (const match of matches) {
            suggestions.push({
                start: completion.content.cursor_start,
                end: completion.content.cursor_end,
                text: match as string,
                type: 'text',
                signature: '',
            });
        }

        return { status: 'success', suggestions };
    }
}