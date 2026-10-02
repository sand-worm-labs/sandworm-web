import { IS_PUBLIC } from '@sandworm/nest-common';
import { AuthGuard } from '../auth.guard';
import { ACCESS_TOKEN_COOKIE } from '@/features/auth/core/utils/cookie';

// Public routes must never fail on auth, but should still know who a
// signed-in caller is (the explore page's isFavorite depends on it).
function setup(session: unknown, cookies: Record<string, string> = { [ACCESS_TOKEN_COOKIE]: 'tok' }) {
  const authService = { validateTokenAndGetUser: jest.fn().mockResolvedValue(session) } as any;
  const reflector = { getAllAndOverride: jest.fn((key: string) => key === IS_PUBLIC) } as any;
  const guard = new AuthGuard(reflector, authService, { record: jest.fn() } as any);
  const request: any = { cookies };
  const context = {
    getHandler: () => null,
    getClass: () => null,
    getType: () => 'http',
    switchToHttp: () => ({ getRequest: () => request }),
  } as any;
  return { guard, context, request, authService };
}

describe('AuthGuard on public routes', () => {
  it('attaches the user when the session cookie is valid', async () => {
    const { guard, context, request } = setup({ id: 'user-1', user: { id: 'user-1' } });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toMatchObject({ id: 'user-1', token: 'tok' });
  });

  it('stays anonymous, without failing, when the token is invalid', async () => {
    const { guard, context, request } = setup(null);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toBeUndefined();
  });

  it('stays anonymous when token validation throws', async () => {
    const { guard, context, request, authService } = setup(null);
    authService.validateTokenAndGetUser.mockRejectedValue(new Error('redis down'));

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toBeUndefined();
  });

  it('does not look anything up when there is no cookie', async () => {
    const { guard, context, request, authService } = setup(null, {});

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(authService.validateTokenAndGetUser).not.toHaveBeenCalled();
    expect(request.user).toBeUndefined();
  });
});
