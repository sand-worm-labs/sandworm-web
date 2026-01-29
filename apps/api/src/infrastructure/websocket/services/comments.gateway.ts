import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server, Socket } from 'socket.io';
import { z } from 'zod';
import { uuidSchema } from '@sandworm/types';
import { Session } from '../../../features/session/domain/session';
import { CommentEntity, DocumentEntity, UserWorkspaceEntity } from '@sandworm/postgresql-typeorm';
import { Comment } from '@/features/collaboration/comment/model/comment.model';


@Injectable()
export class CommentGatewayService {
    private readonly logger = new Logger(CommentGatewayService.name);

    constructor(
        @InjectRepository(CommentEntity)
        private readonly commentRepository: Repository<CommentEntity>,
        @InjectRepository(DocumentEntity)
        private readonly documentRepository: Repository<DocumentEntity>,
        @InjectRepository(UserWorkspaceEntity)
        private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    ) { }

    async fetchDocumentComments(client: Socket, data: { documentId: string }, session: Session): Promise<void> {
        const payload = z.object({ documentId: uuidSchema }).safeParse(data);
        if (!payload.success) {
            this.logger.warn('Invalid fetch comments payload');
            return;
        }

        try {
            // Check authorization - user must have access to workspace
            const document = await this.documentRepository.findOne({
                where: { id: payload.data.documentId },
                select: ['id', 'workspaceId'],
            });

            if (!document) {
                this.logger.warn(`Document ${payload.data.documentId} not found`);
                return;
            }

            const userWorkspace = await this.userWorkspaceRepository.findOne({
                where: {
                    userId: session.user.id,
                    workspaceId: document.workspaceId,
                },
            });

            if (!userWorkspace) {
                this.logger.warn(
                    `User ${session.user.id} attempted to fetch comments for unauthorized document ${payload.data.documentId}`,
                );
                return;
            }

            const comments = await this.commentRepository.find({
                where: { documentId: payload.data.documentId },
                relations: ['author'],
                order: { createdAt: 'ASC' },
            });

            client.emit('document-comments', {
                documentId: payload.data.documentId,
                comments: comments.map((c) => ({
                    ...c,
                    user: {
                        name: c.author.fullName,
                        picture: c.author.avater,
                    },
                    createdAt: c.createdAt.toISOString(),
                    updatedAt: c.updatedAt.toISOString(),
                })),
            });
        } catch (error) {
            this.logger.error(
                `Error fetching comments for document ${payload.data.documentId}`,
                error,
            );
        }
    }

}