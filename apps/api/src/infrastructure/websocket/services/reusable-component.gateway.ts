import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ReusableComponentService } from '@/features/collaboration/component/reusable-component.service';
import { DocumentEntity, ReusableComponentType } from '@sandworm/postgresql-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export type APIReusableComponent = {
    id: string;
    title: string;
    type: ReusableComponentType;
    state: string;
    blockId: string;
    documentId: string;
    instancesCreated: boolean;
    createdAt: string;
    updatedAt: string;
    document: {
        id: string;
        title: string;
    };
}


@Injectable()
export class ComponentGatewayService {
    private readonly logger = new Logger(ComponentGatewayService.name);

    constructor(
        @InjectRepository(DocumentEntity)
        private readonly documentRepository: Repository<DocumentEntity>,
        private readonly resuableComponentService: ReusableComponentService
    ) { }

    async emitComponents(client: Socket, workspaceId: string): Promise<void> {
        try {
            const components = await this.resuableComponentService.getWorkspaceComponents(workspaceId);
            client.emit('workspace-components', { workspaceId, components });
        } catch (error) {
            this.logger.error(`Failed to emit components for workspace ${workspaceId}`, error);
            throw error;
        }
    }

    async broadcastComponent(server: Server, component: APIReusableComponent): Promise<void> {
        try {
            const workspaceId = (
                await this.documentRepository.findOne({
                    where: { id: component.documentId },
                })
            )?.workspaceId;

            if (!workspaceId) {
                this.logger.error(`Could not find workspace for component ${component.id}`);
                return;
            }

            server.to(workspaceId).emit('workspace-component-update', { workspaceId, component });
        } catch (error) {
            this.logger.error(`Failed to broadcast component ${component.id}`, error);
        }
    }


}