import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Socket } from 'socket.io';
import { z } from 'zod';
import { uuidSchema } from '@sandworm/types';
import { JupyterService } from '../../jupyter/jupyter.service';
import { EnvironmentEntity, UserWorkspaceRole } from '@sandworm/postgresql-typeorm';
import { Session } from '@/features/auth/core/types/session.type';

@Injectable()
export class EnvironmentGatewayService {
    private readonly logger = new Logger(EnvironmentGatewayService.name);

    constructor(
        @InjectRepository(EnvironmentEntity)
        private readonly environmentRepository: Repository<EnvironmentEntity>,
        private readonly jupyterService: JupyterService,
    ) { }

    async emitEnvironmentStatus(client: Socket, workspaceId: string): Promise<void> {
        try {
            const environment = await this.environmentRepository.findOne({
                where: { workspaceId },
                select: ['status', 'startedAt'],
            });

            const status = environment?.status ?? 'Stopped';
            const startedAt = environment?.startedAt?.toISOString() ?? null;

            client.emit('environment-status-update', {
                workspaceId,
                status,
                startedAt: status === 'Running' ? startedAt : null,
            });
        } catch (error) {
            this.logger.error(`Failed to emit environment status for workspace ${workspaceId}`, error);
        }
    }

    async getEnvironmentStatus(client: Socket, data: { workspaceId: string }, session: Session): Promise<void> {
        const payload = z.object({ workspaceId: uuidSchema }).safeParse(data);
        if (!payload.success) {
            return;
        }

        const { workspaceId } = payload.data;
        const entry = session.roles?.find(r => r[workspaceId]);
        const role = entry?.[workspaceId];

        if (!entry) {
            client.emit('environment-status-error', { workspaceId, error: 'forbidden' });
            return;
        }

        if (!client.rooms.has(workspaceId)) {
            client.emit('environment-status-error', { workspaceId, error: 'workspace-not-joined' });
            return;
        }

        await this.emitEnvironmentStatus(client, workspaceId);
    }

    async restartEnvironment(client: Socket, data: { workspaceId: string }, session: Session): Promise<void> {
        const payload = z.object({ workspaceId: uuidSchema }).safeParse(data);
        if (!payload.success) {
            return;
        }

        const { workspaceId } = payload.data;
        const entry = session.roles?.find(r => r[workspaceId]);
        const role = entry?.[workspaceId];

        if (!entry) {
            client.emit('environment-status-error', { workspaceId, error: 'forbidden' });
            return;
        }

        if (!client.rooms.has(workspaceId)) {
            client.emit('environment-status-error', { workspaceId, error: 'workspace-not-joined' });
            return;
        }

        if (role === UserWorkspaceRole.VIEWER) {
            client.emit('environment-status-error', { workspaceId, error: 'forbidden' });
            return;
        }

        try {
            await this.jupyterService.restart(workspaceId);
            this.logger.log(`Environment restarted for workspace ${workspaceId}`);
        } catch (error) {
            this.logger.error(`Failed to restart environment for workspace ${workspaceId}`, error);
            client.emit('environment-status-error', { workspaceId, error: 'unexpected' });
        }
    }
}