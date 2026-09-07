import { WsException } from '@nestjs/websockets';
import { WsJwtGuard } from '../ws-jwt.guard';
import { ACCESS_TOKEN_COOKIE } from '@/features/auth/core/utils/cookie';

function makeGuard() {
  const authService = { validateTokenAndGetUser: jest.fn() } as any;
  const guard = new WsJwtGuard(authService);
  return { guard, authService };
}

function makeContext(client: any) {
  return {
    switchToWs: () => ({
      getClient: () => client,
    }),
  } as any;
}

describe('WsJwtGuard', () => {
  describe('canActivate', () => {
    it('allows the connection through immediately when a session is already attached', async () => {
      const { guard, authService } = makeGuard();
      const client = { data: { session: { user: { id: 'u1' } } } };

      const result = await guard.canActivate(makeContext(client));

      expect(result).toBe(true);
      expect(authService.validateTokenAndGetUser).not.toHaveBeenCalled();
    });

    it('throws WsException when no token can be extracted from the handshake', async () => {
      const { guard } = makeGuard();
      const client = { data: {}, request: { headers: {} }, handshake: {} };

      await expect(guard.canActivate(makeContext(client))).rejects.toThrow(WsException);
    });

    it('extracts the token from the cookie header and attaches the resulting session', async () => {
      const { guard, authService } = makeGuard();
      const client: any = {
        data: {},
        request: { headers: { cookie: `${ACCESS_TOKEN_COOKIE}=cookie-token; other=1` } },
        handshake: {},
      };
      const user = { id: 'u1' };
      authService.validateTokenAndGetUser.mockResolvedValue({ user });

      const result = await guard.canActivate(makeContext(client));

      expect(authService.validateTokenAndGetUser).toHaveBeenCalledWith('cookie-token');
      expect(result).toBe(true);
      expect(client.data.session).toEqual({ payload: { user }, user });
    });

    it('falls back to handshake.auth.token when no cookie is present', async () => {
      const { guard, authService } = makeGuard();
      const client: any = {
        data: {},
        request: { headers: {} },
        handshake: { auth: { token: 'auth-token' } },
      };
      authService.validateTokenAndGetUser.mockResolvedValue({ user: { id: 'u2' } });

      await guard.canActivate(makeContext(client));

      expect(authService.validateTokenAndGetUser).toHaveBeenCalledWith('auth-token');
    });

    it('falls back to handshake.query.token when no cookie or auth token is present', async () => {
      const { guard, authService } = makeGuard();
      const client: any = {
        data: {},
        request: { headers: {} },
        handshake: { query: { token: 'query-token' } },
      };
      authService.validateTokenAndGetUser.mockResolvedValue({ user: { id: 'u3' } });

      await guard.canActivate(makeContext(client));

      expect(authService.validateTokenAndGetUser).toHaveBeenCalledWith('query-token');
    });

    it('falls back to a Bearer authorization header when nothing else is present', async () => {
      const { guard, authService } = makeGuard();
      const client: any = {
        data: {},
        request: { headers: {} },
        handshake: { headers: { authorization: 'Bearer header-token' } },
      };
      authService.validateTokenAndGetUser.mockResolvedValue({ user: { id: 'u4' } });

      await guard.canActivate(makeContext(client));

      expect(authService.validateTokenAndGetUser).toHaveBeenCalledWith('header-token');
    });

    it('throws WsException when the token does not resolve to a user', async () => {
      const { guard, authService } = makeGuard();
      const client: any = {
        data: {},
        request: { headers: {} },
        handshake: { auth: { token: 'bad-token' } },
      };
      authService.validateTokenAndGetUser.mockResolvedValue({ user: null });

      await expect(guard.canActivate(makeContext(client))).rejects.toThrow(WsException);
    });

    it('throws WsException when validateTokenAndGetUser rejects', async () => {
      const { guard, authService } = makeGuard();
      const client: any = {
        data: {},
        request: { headers: {} },
        handshake: { auth: { token: 'bad-token' } },
      };
      authService.validateTokenAndGetUser.mockRejectedValue(new Error('jwt expired'));

      await expect(guard.canActivate(makeContext(client))).rejects.toThrow(WsException);
    });
  });
});
