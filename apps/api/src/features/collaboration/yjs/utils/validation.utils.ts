import { Logger } from '@nestjs/common';
import * as http from 'http';
import * as cookie from 'cookie';
import qs from 'querystring';
import { z } from 'zod';
import { Repository } from 'typeorm';
import { DocumentEntity, UserWorkspaceRole, UserWorkspaceEntity, UserWorkspaceStatus } from '@sandworm/postgresql-typeorm';
import { SessionService } from '@/features/session/session.service';
import { RequestData } from '../types/yjs.types';

const logger = new Logger('ValidationUtils');

export async function getRequestData(
    req: http.IncomingMessage,
    sessionService: SessionService,
    documentRepository: Repository<DocumentEntity>,
): Promise<RequestData | null> {
    try {
        const cookiesHeader = req.headers.cookie;
        const cookies = cookie.parse(cookiesHeader ?? '');
        const query = qs.parse(req.url?.split('?')[1] ?? '');

        const docId = query['documentId'];
        const clock = parseInt((query['clock'] ?? '').toString());
        const isApp = query['isApp'] === 'true';
        const userId = query['userId']?.toString() ?? null;

        const args = z
            .object({
                docId: z.string().uuid(),
                clock: z.number().int(),
                isApp: z.boolean(),
                userId: z.string().uuid().nullable().optional(),
            })
            .safeParse({ docId, clock, isApp, userId });

        if (!args.success) {
            logger.warn('Invalid query string', args.error);
            return null;
        }

        const document = await documentRepository.findOne({
            where: { id: args.data.docId },
            relations: ['yjsAppDocuments'],
        });

        if (!document) {
            logger.warn(`Document ${args.data.docId} not found`);
            return null;
        }

        const session = await sessionService.validateSessionFromAuthToken(cookies['auth-token']);

        if (!session) {
            logger.warn('No valid session found');
            return null;
        }

        const userWorkspace = session.userWorkspaces[document.workspaceId];

        if (!userWorkspace) {
            logger.warn(
                `User ${session.user.id} does not have access to workspace ${document.workspaceId}`,
            );
            return null;
        }

        if (args.data.userId && args.data.userId !== session.user.id) {
            logger.warn('User ID mismatch');
            return null;
        }

        const appId = args.data.isApp
            ? (document.yjsAppDocuments?.[0]?.id ?? null)
            : null;

        if (args.data.isApp && !appId) {
            logger.warn(`No yjsAppDocument found for document ${args.data.docId}`);
            return null;
        }

        return {
            document,
            clock: args.data.clock,
            authUser: session.user,
            role: userWorkspace.role as UserWorkspaceRole,
            isApp: args.data.isApp,
            userId: args.data.userId ?? null,
            appId,
            workspaceId: document.workspaceId,
        };
    } catch (err) {
        logger.error(`Failed to get request data: ${err}`);
        return null;
    }
}

export async function getUserRole(
    userId: string,
    workspaceId: string,
    userWorkspaceMemberRepository: Repository<UserWorkspaceEntity>,
): Promise<UserWorkspaceRole | null> {
    try {
        const member = await userWorkspaceMemberRepository.findOne({
            where: { userId, workspaceId, status: UserWorkspaceStatus.ACTIVE },
        });

        if (!member) {
            logger.warn(`User ${userId} not found in workspace ${workspaceId}`);
            return null;
        }

        return member.role as UserWorkspaceRole;
    } catch (err) {
        logger.error(`Failed to get user role: ${err}`);
        return null;
    }
}