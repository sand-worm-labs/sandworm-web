import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IS_PUBLIC } from '@sandworm/nest-common';
import {
  DocumentEntity,
  DocumentVisibility,
  UserWorkspaceEntity,
  UserWorkspaceRole,
  UserWorkspaceStatus,
} from '@sandworm/postgresql-typeorm';
import { In, IsNull, type Repository } from 'typeorm';
import {
  ALLOW_SHARED_DOCUMENT,
  SKIP_WORKSPACE_CHECK,
} from '../decorators/workspace-access.decorator';

// Any argument with one of these names is a workspace the caller acts on.
const WORKSPACE_KEYS = ['workspaceId', 'targetWorkspaceId'] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Request = {
  user?: { id?: string };
  workspaceRoles?: Record<string, UserWorkspaceRole>;
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: unknown;
};

// Runs after AuthGuard. A request that names a workspace must come from an
// active member of it, so no endpoint can trust a client-supplied workspaceId.
@Injectable()
export class WorkspaceAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly members: Repository<UserWorkspaceEntity>,
    private readonly documents: Repository<DocumentEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const type = context.getType<string>();
    if (type !== 'http' && type !== 'graphql') return true;

    const flag = (key: string) =>
      this.reflector.getAllAndOverride<boolean>(key, [context.getHandler(), context.getClass()]) ?? false;
    // Public routes decide access themselves (published notebooks, invitations).
    if (flag(IS_PUBLIC) || flag(SKIP_WORKSPACE_CHECK)) return true;

    const { request, args, isWrite } = this.read(context, type);
    const workspaceIds = collectWorkspaceIds(args);
    if (workspaceIds.length === 0) return true;

    for (const id of workspaceIds) {
      if (!UUID.test(id)) throw new BadRequestException('Invalid workspace id');
    }

    const userId = request.user?.id;
    if (!userId) throw new ForbiddenException('You are not a member of this workspace');

    const memberships = await this.members.find({
      where: { userId, workspaceId: In(workspaceIds), status: UserWorkspaceStatus.ACTIVE },
      select: ['workspaceId', 'role'],
    });
    const roleOf = new Map(memberships.map(m => [m.workspaceId, m.role]));
    // Lets handlers tailor what they return to the caller's role.
    request.workspaceRoles = Object.fromEntries(roleOf);

    const missing = workspaceIds.filter(id => !roleOf.has(id));
    if (missing.length > 0) {
      if (!isWrite && missing.length === 1 && workspaceIds.length === 1 && flag(ALLOW_SHARED_DOCUMENT)) {
        if (await this.isShared(missing[0], args)) return true;
      }
      throw new ForbiddenException('You are not a member of this workspace');
    }

    // Being a member of the named workspace is not enough when the request also
    // names a notebook: it must be one of that workspace's notebooks.
    await this.assertDocumentInWorkspace(args);
    return true;
  }

  private async assertDocumentInWorkspace(args: unknown[]): Promise<void> {
    const documentId = findKey(args, 'documentId');
    const workspaceId = findKey(args, 'workspaceId');
    if (!documentId || !workspaceId) return;
    if (!UUID.test(documentId)) throw new BadRequestException('Invalid document id');
    // withDeleted: restoring a notebook from the trash names a deleted one.
    const count = await this.documents.count({ where: { id: documentId, workspaceId }, withDeleted: true });
    if (count === 0) throw new NotFoundException('Notebook not found in this workspace');
  }

  private read(context: ExecutionContext, type: string): { request: Request; args: unknown[]; isWrite: boolean } {
    if (type === 'graphql') {
      const gql = GqlExecutionContext.create(context);
      const operation = gql.getInfo()?.parentType?.name;
      return {
        request: gql.getContext().req ?? {},
        args: [gql.getArgs()],
        isWrite: operation === 'Mutation',
      };
    }
    const request = context.switchToHttp().getRequest<Request & { method?: string }>();
    return {
      request,
      args: [request.params, request.query, request.body],
      isWrite: !['GET', 'HEAD', 'OPTIONS'].includes((request.method ?? 'GET').toUpperCase()),
    };
  }

  // A link-shared or published notebook can be read by anyone signed in.
  private async isShared(workspaceId: string, args: unknown[]): Promise<boolean> {
    const documentId = findKey(args, 'documentId');
    if (!documentId || !UUID.test(documentId)) return false;
    const count = await this.documents.count({
      where: {
        id: documentId,
        workspaceId,
        deletedAt: IsNull(),
        visibility: In([DocumentVisibility.LINK, DocumentVisibility.PUBLIC]),
      },
    });
    return count > 0;
  }
}

// Workspace ids at the top level of each argument source, and one level down
// (GraphQL `input` objects).
export function collectWorkspaceIds(sources: unknown[]): string[] {
  const ids = new Set<string>();
  const take = (obj: unknown) => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
    for (const key of WORKSPACE_KEYS) {
      const value = (obj as Record<string, unknown>)[key];
      if (typeof value === 'string' && value) ids.add(value);
    }
  };
  for (const source of sources) {
    take(source);
    if (source && typeof source === 'object') {
      for (const value of Object.values(source as Record<string, unknown>)) take(value);
    }
  }
  return [...ids];
}

function findKey(sources: unknown[], key: string): string | undefined {
  for (const source of sources) {
    if (!source || typeof source !== 'object') continue;
    const direct = (source as Record<string, unknown>)[key];
    if (typeof direct === 'string') return direct;
    for (const value of Object.values(source as Record<string, unknown>)) {
      if (value && typeof value === 'object' && typeof (value as Record<string, unknown>)[key] === 'string') {
        return (value as Record<string, string>)[key];
      }
    }
  }
  return undefined;
}
