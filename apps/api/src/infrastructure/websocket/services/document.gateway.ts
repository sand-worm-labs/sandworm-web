import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server, Socket } from 'socket.io';
import { DocumentEntity } from '@sandworm/postgresql-typeorm';

@Injectable()
export class DocumentGatewayService {
    private readonly logger = new Logger(DocumentGatewayService.name);

    constructor(
        @InjectRepository(DocumentEntity)
        private readonly documentRepository: Repository<DocumentEntity>,
    ) { }

    async emitDocuments(client: Socket, workspaceId: string): Promise<void> {
        try {
            let documents = await this.documentRepository.find({
                where: { workspaceId },
                order: { orderIndex: 'ASC' },
            });


            client.emit('workspace-documents', { workspaceId, documents });
        } catch (error) {
            this.logger.error(`Failed to emit documents for workspace ${workspaceId}`, error);
            throw error;
        }
    }

    async broadcastDocuments(server: Server, workspaceId: string): Promise<void> {
        try {
            const documents = await this.documentRepository.find({
                where: { workspaceId },
                order: { orderIndex: 'ASC' },
            });

            server.to(workspaceId).emit('workspace-documents', { workspaceId, documents });
        } catch (error) {
            this.logger.error(`Failed to broadcast documents for workspace ${workspaceId}`, error);
        }
    }

    async broadcastDocument(server: Server, workspaceId: string, documentId: string): Promise<void> {
        try {
            const document = await this.documentRepository.findOne({
                where: { id: documentId },
            });
            if (!document) {
                
                return;
            }

            server.to(workspaceId).emit('workspace-document-update', { workspaceId, document });
        } catch (error) {
            this.logger.error(`Failed to broadcast document ${documentId}`, error);
        }
    }
}