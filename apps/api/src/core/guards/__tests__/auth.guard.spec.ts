import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '../auth.guard';
import { ACCESS_TOKEN_COOKIE } from '@/features/auth/core/utils/cookie';

function makeGuard() {
  const reflector = { getAllAndOverride: jest.fn() } as any;
  const authService = { validateTokenAndGetUser: jest.fn() } as any;
  const guard = new AuthGuard(reflector, authService);
  return { guard, reflector, authService };
}

function makeHttpContext(cookies: Record<string, string> = {}) {
  const request: any = { cookies };
  return {
    getType: () => 'http',
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as any;
}

describe('AuthGuard', () => {
  describe('canActivate', () => {
    it('allows the request through when the route is public, without checking for a token', async () => {
      const { guard, reflector, authService } = makeGuard();
      reflector.getAllAndOverride.mockReturnValueOnce(true); // IS_PUBLIC

      const result = await guard.canActivate(makeHttpContext());

      expect(result).toBe(true);
      expect(authService.validateTokenAndGetUser).not.toHaveBeenCalled();
    });

    it('allows the request through when auth is optional and no token is present', async () => {
      const { guard, reflector, authService } = makeGuard();
      reflector.getAllAndOverride
        .mockReturnValueOnce(false) // IS_PUBLIC
        .mockReturnValueOnce(true); // IS_AUTH_OPTIONAL

      const result = await guard.canActivate(makeHttpContext());

      expect(result).toBe(true);
      expect(authService.validateTokenAndGetUser).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when no token is present and auth is required', async () => {
      const { guard, reflector } = makeGuard();
      reflector.getAllAndOverride.mockReturnValueOnce(false).mockReturnValueOnce(false);

      await expect(guard.canActivate(makeHttpContext())).rejects.toThrow(UnauthorizedException);
    });

    it('validates the token, attaches the user to the request, and allows the request through', async () => {
      const { guard, reflector, authService } = makeGuard();
      reflector.getAllAndOverride.mockReturnValueOnce(false).mockReturnValueOnce(false);
      const user = { id: 'u1' };
      authService.validateTokenAndGetUser.mockResolvedValue(user);
      const context = makeHttpContext({ [ACCESS_TOKEN_COOKIE]: 'token-abc' });

      const result = await guard.canActivate(context);

      expect(authService.validateTokenAndGetUser).toHaveBeenCalledWith('token-abc');
      expect(result).toBe(true);
      const request = context.switchToHttp().getRequest();
      expect(request.user).toEqual({ id: 'u1', token: 'token-abc' });
    });

    it('reads the request from the GraphQL execution context when the request type is graphql', async () => {
      const { guard, reflector, authService } = makeGuard();
      reflector.getAllAndOverride.mockReturnValueOnce(false).mockReturnValueOnce(true); // auth optional
      const gqlRequest: any = { cookies: {} };

      const gqlModule = await import('@nestjs/graphql');
      const createSpy = jest
        .spyOn(gqlModule.GqlExecutionContext, 'create')
        .mockReturnValue({ getContext: () => ({ req: gqlRequest }) } as any);

      const context = {
        getType: () => 'graphql',
        getHandler: () => ({}),
        getClass: () => ({}),
      } as any;

      const result = await guard.canActivate(context);

      expect(createSpy).toHaveBeenCalledWith(context);
      expect(result).toBe(true);
      expect(authService.validateTokenAndGetUser).not.toHaveBeenCalled();

      createSpy.mockRestore();
    });
  });
});
