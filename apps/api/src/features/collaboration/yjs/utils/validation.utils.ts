import { Logger } from '@nestjs/common';
import * as http from 'http';
import * as cookie from 'cookie';
import qs from 'querystring';
import { z } from 'zod';
import { Repository } from 'typeorm';
import { DocumentEntity, UserWorkspaceRole } from '@sandworm/postgresql-typeorm';
import { SessionService } from '@/features/session/session.service';

const logger = new Logger('ValidationUtils');

export interface RequestData {
    document: DocumentEntity;
    clock: number;
    authUser: any;
    role: UserWorkspaceRole;
    isApp: boolean;
    userId: string | null;
}

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
        const authToken = cookies['auth-token'] ?? query['authToken']?.toString() ?? null;

        logger.debug(`Parsed query params: docId=${docId}, clock=${clock}, isApp=${isApp}, userId=${userId}`);
        logger.debug(`Parsed auth token: ${authToken}`);
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
        });

        if (!document) {
            logger.warn(`Document ${args.data.docId} not found`);
            return null;
        }

        const session = await sessionService.validateSessionFromAuthToken(authToken);

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

        return {
            document,
            clock: args.data.clock,
            authUser: session.user,
            role: userWorkspace.role as UserWorkspaceRole,
            isApp: args.data.isApp,
            userId: args.data.userId ?? null,
        };
    } catch (err) {
        logger.error(`Failed to get request data: ${err}`);
        return null;
    }
}

export async function getUserRole(
    userId: string,
    workspaceId: string,
): Promise<UserWorkspaceRole | null> {
    try {
        // TODO: Implement actual role lookup from database
        return UserWorkspaceRole.EDITOR;
    } catch (err) {
        logger.error(`Failed to get user role: ${err}`);
        return null;
    }
}