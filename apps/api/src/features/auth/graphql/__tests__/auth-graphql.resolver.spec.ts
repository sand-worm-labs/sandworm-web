import { AuthGraphqlResolver } from '../auth-graphql.resolver';

function makeResolver() {
  const authGraphqlService = {
    login: jest.fn(),
  } as any;
  const authService = {
    issueTokenPair: jest.fn(),
  } as any;

  const resolver = new AuthGraphqlResolver(authGraphqlService, authService);
  return { resolver, authGraphqlService, authService };
}

const TOKENS = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  accessTokenExpires: new Date('2030-01-01'),
  refreshTokenExpires: new Date('2030-02-01'),
};

describe('AuthGraphqlResolver', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('login', () => {
    it('delegates to authGraphqlService.login, issues tokens, and sets cookies on the reply', async () => {
      const { resolver, authGraphqlService, authService } = makeResolver();
      const user = { id: 'u1', user: { id: 'u1' }, roles: [{ role: 'owner' }] };
      authGraphqlService.login.mockResolvedValue(user);
      authService.issueTokenPair.mockResolvedValue(TOKENS);
      const reply = { setCookie: jest.fn() };
      const ctx = { reply };

      const result = await resolver.login({ email: 'a@b.com', password: 'pw' } as any, ctx);

      expect(authGraphqlService.login).toHaveBeenCalledWith({ email: 'a@b.com', password: 'pw' });
      expect(authService.issueTokenPair).toHaveBeenCalledWith('u1');
      expect(reply.setCookie).toHaveBeenCalled();
      expect(result.id).toBe('u1');
      expect(result.user).toEqual(user.user);
      expect(result.roles).toEqual(user.roles);
    });

    it('includes the access token in the payload in development', async () => {
      process.env.NODE_ENV = 'development';
      const { resolver, authGraphqlService, authService } = makeResolver();
      authGraphqlService.login.mockResolvedValue({ id: 'u1', user: {}, roles: [] });
      authService.issueTokenPair.mockResolvedValue(TOKENS);
      const ctx = { reply: { setCookie: jest.fn() } };

      const result = await resolver.login({ email: 'a@b.com', password: 'pw' } as any, ctx);

      expect(result.token).toBe(TOKENS.accessToken);
    });

    it('omits the access token from the payload outside development', async () => {
      process.env.NODE_ENV = 'production';
      const { resolver, authGraphqlService, authService } = makeResolver();
      authGraphqlService.login.mockResolvedValue({ id: 'u1', user: {}, roles: [] });
      authService.issueTokenPair.mockResolvedValue(TOKENS);
      const ctx = { reply: { setCookie: jest.fn() } };

      const result = await resolver.login({ email: 'a@b.com', password: 'pw' } as any, ctx);

      expect(result.token).toBeNull();
    });
  });
});
