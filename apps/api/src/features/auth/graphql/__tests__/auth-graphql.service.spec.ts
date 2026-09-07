import { AuthGraphqlService } from '../auth-graphql.service';

function makeService() {
  const authService = {
    validateLogin: jest.fn(),
  } as any;

  const service = new AuthGraphqlService(authService);
  return { service, authService };
}

describe('AuthGraphqlService', () => {
  describe('login', () => {
    it('delegates to authService.validateLogin and maps the result to an AuthPayload', async () => {
      const { service, authService } = makeService();
      const user = { id: 'u1', email: 'a@b.com' };
      const roles = [{ role: 'owner' }];
      authService.validateLogin.mockResolvedValue({ user, roles });

      const result = await service.login({ email: 'a@b.com', password: 'pw' });

      expect(authService.validateLogin).toHaveBeenCalledWith({ email: 'a@b.com', password: 'pw' });
      expect(result).toEqual({ id: 'u1', user, roles });
    });
  });
});
