import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Socket } from 'socket.io';
import { z } from 'zod';
import { uuidSchema } from '@sandworm/types';
import { Session } from '../../../features/session/domain/session';
import { DocumentGatewayService } from './document.gateway';
import { EnvironmentGatewayService } from './environment.gateway';
import { ComponentGatewayService } from './reusable-component.gateway';
import { UserEntity, UserWorkspaceEntity } from '@sandworm/postgresql-typeorm';

@Injectable()
export class WorkspaceGatewayService {
    private readonly logger = new Logger(WorkspaceGatewayService.name);

    constructor(
        @InjectRepository(UserWorkspaceEntity)
        private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly documentGatewayService: DocumentGatewayService,
        private readonly environmentGatewayService: EnvironmentGatewayService,
        private readonly componentGatewayService: ComponentGatewayService,
    ) { }

    async joinWorkspace(
        client: Socket,
        data: { workspaceId: string },
        session: Session,
    ): Promise<void> {
        const payload = z.object({ workspaceId: uuidSchema }).safeParse(data);
        if (!payload.success) {
            return;
        }
        const { workspaceId } = payload.data;

        try {
            let userWorkspace = session.userWorkspaces?.[workspaceId];

            if (!userWorkspace) {
                userWorkspace = await this.userWorkspaceRepository.findOne({
                    where: {
                        workspaceId,
                        userId: session.user.id,
                    },
                });

                if (!userWorkspace) {
                    client.emit('workspace-error', { workspaceId, error: 'forbidden' });
                    return;
                }

                if (!session.userWorkspaces) {
                    session.userWorkspaces = {};
                }
                session.userWorkspaces[workspaceId] = userWorkspace;
            }

            if (!client.rooms.has(workspaceId)) {
                await client.join(workspaceId);

                await this.userRepository.update(
                    { id: session.user.id },
                    { lastVisitedWorkspaceId: workspaceId },
                );
            }

            await this.emitInitialData(client, workspaceId);

            this.logger.log(`User ${session.user.id} joined workspace ${workspaceId}`);
        } catch (error) {
            this.logger.error(
                `Error joining workspace ${workspaceId} for user ${session.user.id}`,
                error,
            );
            client.emit('workspace-error', { workspaceId, error: 'unexpected' });
        }
    }

    async leaveWorkspace(client: Socket, data: unknown, session: Session): Promise<void> {
        const payload = z.object({ workspaceId: uuidSchema }).safeParse(data);
        if (!payload.success) {
            return;
        }

        const { workspaceId } = payload.data;

        try {
            await client.leave(workspaceId);
            this.logger.log(`User ${session.user.id} left workspace ${workspaceId}`);
        } catch (error) {
            this.logger.error(
                `Error leaving workspace ${workspaceId} for user ${session.user.id}`,
                error,
            );
            client.emit('workspace-error', { workspaceId, error: 'unexpected' });
        }
    }

    private async emitInitialData(
        client: Socket,
        workspaceId: string,
    ): Promise<void> {
        await Promise.allSettled([
            this.documentGatewayService.emitDocuments(client, workspaceId),
            this.environmentGatewayService.emitEnvironmentStatus(client, workspaceId),
            this.componentGatewayService.emitComponents(client, workspaceId),
        ]);
    }
}