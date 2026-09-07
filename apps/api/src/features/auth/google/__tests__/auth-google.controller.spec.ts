import { AuthGoogleController } from '../auth-google.controller';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/features/auth/core/utils/cookie';

function makeController() {
  const authService = {
    validateSocialLogin: jest.fn(),
    issueTokenPair: jest.fn(),
  } as any;
  const authGoogleService = {
    getProfileByToken: jest.fn(),
  } as any;

  const controller = new AuthGoogleController(authService, authGoogleService);
  return { controller, authService, authGoogleService };
}

describe('AuthGoogleController', () => {
  describe('login', () => {
    it('exchanges the code, validates the social login, issues tokens, and sets cookies', async () => {
      const { controller, authService, authGoogleService } = makeController();
      const socialData = { id: 'g1', email: 'a@b.com' };
      const user = { id: 'u1' };
      const roles = [{ role: 'owner' }];
      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        accessTokenExpires: new Date('2030-01-01'),
        refreshTokenExpires: new Date('2030-02-01'),
      };
      authGoogleService.getProfileByToken.mockResolvedValue(socialData);
      authService.validateSocialLogin.mockResolvedValue({ user, roles });
      authService.issueTokenPair.mockResolvedValue(tokens);
      const response = { setCookie: jest.fn() } as any;

      const result = await controller.login({ code: 'abc' } as any, response);

      expect(authGoogleService.getProfileByToken).toHaveBeenCalledWith({ code: 'abc' });
      expect(authService.validateSocialLogin).toHaveBeenCalledWith('google', socialData);
      expect(authService.issueTokenPair).toHaveBeenCalledWith('u1');
      expect(response.setCookie).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE, tokens.accessToken, expect.any(Object));
      expect(response.setCookie).toHaveBeenCalledWith(REFRESH_TOKEN_COOKIE, tokens.refreshToken, expect.any(Object));
      expect(result).toEqual({ user, roles });
    });
  });
});
