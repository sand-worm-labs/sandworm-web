import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserWorkspaceRole } from '@sandworm/postgresql-typeorm';
import { collectWorkspaceIds, WorkspaceAccessGuard } from '../workspace-access.guard';
import {
  ALLOW_SHARED_DOCUMENT,
  SKIP_WORKSPACE_CHECK,
} from '../../decorators/workspace-access.decorator';

const WS = '11111111-1111-4111-8111-111111111111';
const OTHER_WS = '22222222-2222-4222-8222-222222222222';
const DOC = '33333333-3333-4333-8333-333333333333';

function makeGuard(flags: Record<string, boolean> = {}) {
  const reflector = { getAllAndOverride: jest.fn((key: string) => flags[key]) } as unknown as Reflector;
  const members = { find: jest.fn().mockResolvedValue([]) };
  const documents = { count: jest.fn().mockResolvedValue(1) };
  const guard = new WorkspaceAccessGuard(reflector, members as any, documents as any);
  return { guard, members, documents };
}

function http(request: Record<string, unknown>) {
  return {
    getType: () => 'http',
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
  } as any;
}

const user = { id: 'user-1' };

describe('WorkspaceAccessGuard', () => {
  it('lets through requests that name no workspace', async () => {
    const { guard, members } = makeGuard();
    await expect(guard.canActivate(http({ user, method: 'GET', params: {} }))).resolves.toBe(true);
    expect(members.find).not.toHaveBeenCalled();
  });

  it('rejects a caller who is not a member of the workspace', async () => {
    const { guard } = makeGuard();
    const ctx = http({ user, method: 'GET', params: { workspaceId: WS } });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('allows an active member and records their role', async () => {
    const { guard, members } = makeGuard();
    members.find.mockResolvedValue([{ workspaceId: WS, role: UserWorkspaceRole.VIEWER }]);
    const request: Record<string, any> = { user, method: 'GET', params: { workspaceId: WS } };
    await expect(guard.canActivate(http(request))).resolves.toBe(true);
    expect(request.workspaceRoles).toEqual({ [WS]: UserWorkspaceRole.VIEWER });
  });

  it('finds workspace ids inside input objects, including fork targets', () => {
    expect(collectWorkspaceIds([{ input: { workspaceId: WS } }, { targetWorkspaceId: OTHER_WS }]).sort()).toEqual(
      [WS, OTHER_WS].sort(),
    );
  });

  it('rejects a malformed workspace id before touching the database', async () => {
    const { guard, members } = makeGuard();
    await expect(guard.canActivate(http({ user, method: 'GET', params: { workspaceId: 'x' } }))).rejects.toThrow(
      BadRequestException,
    );
    expect(members.find).not.toHaveBeenCalled();
  });


  it("rejects a notebook from another workspace even for a member", async () => {
    const { guard, members, documents } = makeGuard();
    members.find.mockResolvedValue([{ workspaceId: WS, role: UserWorkspaceRole.EDITOR }]);
    documents.count.mockResolvedValue(0);
    const ctx = http({ user, method: 'POST', params: { workspaceId: WS, documentId: DOC } });
    await expect(guard.canActivate(ctx)).rejects.toThrow(NotFoundException);
  });

  it('lets a non-member read a link-shared notebook where allowed', async () => {
    const { guard, documents } = makeGuard({ [ALLOW_SHARED_DOCUMENT]: true });
    documents.count.mockResolvedValue(1);
    const ctx = http({ user, method: 'GET', query: { workspaceId: WS, documentId: DOC } });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('never lets a non-member write to a shared notebook', async () => {
    const { guard } = makeGuard({ [ALLOW_SHARED_DOCUMENT]: true });
    const ctx = http({ user, method: 'POST', params: { workspaceId: WS, documentId: DOC } });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('skips handlers that check access themselves', async () => {
    const { guard, members } = makeGuard({ [SKIP_WORKSPACE_CHECK]: true });
    await expect(guard.canActivate(http({ user, method: 'GET', params: { workspaceId: WS } }))).resolves.toBe(true);
    expect(members.find).not.toHaveBeenCalled();
  });

  it('rejects anonymous callers that name a workspace', async () => {
    const { guard } = makeGuard();
    await expect(guard.canActivate(http({ method: 'GET', params: { workspaceId: WS } }))).rejects.toThrow(
      ForbiddenException,
    );
  });
});
