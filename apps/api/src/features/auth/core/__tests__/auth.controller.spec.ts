import { AuthController } from '../auth.controller';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../utils/cookie';

function makeController() {
  const service = {
    validateLogin: jest.fn(),
    issueTokenPair: jest.fn(),
    register: jest.fn(),
    confirmEmail: jest.fn(),
    confirmNewEmail: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    refreshTokens: jest.fn(),
  } as any;

  const controller = new AuthController(service);
  return { controller, service };
}

function makeResponse() {
  return {
    setCookie: jest.fn(),
    clearCookie: jest.fn(),
  } as any;
}

const TOKENS = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  accessTokenExpires: new Date('2030-01-01'),
  refreshTokenExpires: new Date('2030-02-01'),
};

describe('AuthController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('validates credentials, issues tokens, sets cookies, and returns the user and roles', async () => {
      const { controller, service } = makeController();
      const user = { id: 'u1' };
      const roles = [{ role: 'owner' }];
      service.validateLogin.mockResolvedValue({ user, roles });
      service.issueTokenPair.mockResolvedValue(TOKENS);
      const response = makeResponse();

      const result = await controller.login({ email: 'a@b.com', password: 'pw' } as any, response);

      expect(service.validateLogin).toHaveBeenCalledWith({ email: 'a@b.com', password: 'pw' });
      expect(service.issueTokenPair).toHaveBeenCalledWith('u1');
      expect(response.setCookie).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE, TOKENS.accessToken, expect.any(Object));
      expect(response.setCookie).toHaveBeenCalledWith(REFRESH_TOKEN_COOKIE, TOKENS.refreshToken, expect.any(Object));
      expect(result).toEqual({ user, roles });
    });
  });

  describe('register', () => {
    it('delegates to the service', async () => {
      const { controller, service } = makeController();
      const dto = { email: 'a@b.com' } as any;

      await controller.register(dto);

      expect(service.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('confirmEmail', () => {
    it('delegates the hash to the service', async () => {
      const { controller, service } = makeController();

      await controller.confirmEmail({ hash: 'h1' } as any);

      expect(service.confirmEmail).toHaveBeenCalledWith('h1');
    });
  });

  describe('confirmNewEmail', () => {
    it('delegates the hash to the service', async () => {
      const { controller, service } = makeController();

      await controller.confirmNewEmail({ hash: 'h1' } as any);

      expect(service.confirmNewEmail).toHaveBeenCalledWith('h1');
    });
  });

  describe('forgotPassword', () => {
    it('delegates the email to the service', async () => {
      const { controller, service } = makeController();

      await controller.forgotPassword({ email: 'a@b.com' } as any);

      expect(service.forgotPassword).toHaveBeenCalledWith('a@b.com');
    });
  });

  describe('resetPassword', () => {
    it('delegates the hash and password to the service', async () => {
      const { controller, service } = makeController();

      await controller.resetPassword({ hash: 'h1', password: 'newpw' } as any);

      expect(service.resetPassword).toHaveBeenCalledWith('h1', 'newpw');
    });
  });

  describe('refresh', () => {
    it('reads the refresh cookie, refreshes tokens, and re-sets cookies', async () => {
      const { controller, service } = makeController();
      service.refreshTokens.mockResolvedValue(TOKENS);
      const request = { cookies: { [REFRESH_TOKEN_COOKIE]: 'raw-refresh-token' } } as any;
      const response = makeResponse();

      await controller.refresh(request, response);

      expect(service.refreshTokens).toHaveBeenCalledWith('raw-refresh-token');
      expect(response.setCookie).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE, TOKENS.accessToken, expect.any(Object));
      expect(response.setCookie).toHaveBeenCalledWith(REFRESH_TOKEN_COOKIE, TOKENS.refreshToken, expect.any(Object));
    });
  });

  describe('logout', () => {
    it('clears both auth cookies', async () => {
      const { controller } = makeController();
      const response = makeResponse();

      await controller.logout(response);

      expect(response.clearCookie).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE);
      expect(response.clearCookie).toHaveBeenCalledWith(REFRESH_TOKEN_COOKIE, { path: '/auth/refresh' });
    });
  });
});
