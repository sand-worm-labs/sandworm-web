import { UnprocessableEntityException } from '@nestjs/common';
import { AuthGithubService } from '../auth-github.service';

const GITHUB_CONFIG = { clientId: 'client-id', clientSecret: 'client-secret' };

function makeService() {
  const configService = {
    getOrThrow: jest.fn(() => GITHUB_CONFIG),
  } as any;

  return new AuthGithubService(configService);
}

function jsonResponse(ok: boolean, body: unknown) {
  return { ok, json: jest.fn().mockResolvedValue(body) } as any;
}

describe('AuthGithubService', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('getProfileByToken', () => {
    it('exchanges the code, fetches the profile, and returns the mapped social data when the email is public', async () => {
      const service = makeService();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(jsonResponse(true, { access_token: 'gh-access-token' }))
        .mockResolvedValueOnce(
          jsonResponse(true, {
            id: 42,
            login: 'octocat',
            name: 'Jane Doe',
            email: 'jane@example.com',
            avatar_url: 'https://avatar/jane.png',
          }),
        );

      const result = await service.getProfileByToken({ code: 'abc' });

      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        'https://github.com/login/oauth/access_token',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            client_id: GITHUB_CONFIG.clientId,
            client_secret: GITHUB_CONFIG.clientSecret,
            code: 'abc',
          }),
        }),
      );
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        'https://api.github.com/user',
        expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer gh-access-token' }) }),
      );
      expect(result).toEqual({
        id: '42',
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        avatar: 'https://avatar/jane.png',
      });
    });

    it('falls back to the primary verified email when the profile has none public', async () => {
      const service = makeService();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(jsonResponse(true, { access_token: 'gh-access-token' }))
        .mockResolvedValueOnce(jsonResponse(true, { id: 42, login: 'octocat', name: null, email: null, avatar_url: 'a' }))
        .mockResolvedValueOnce(
          jsonResponse(true, [
            { email: 'secondary@example.com', primary: false, verified: true },
            { email: 'primary@example.com', primary: true, verified: true },
          ]),
        );

      const result = await service.getProfileByToken({ code: 'abc' });

      expect(result.email).toBe('primary@example.com');
      expect(result.firstName).toBeNull();
      expect(result.lastName).toBeNull();
    });

    it('throws when the token exchange response is not ok', async () => {
      const service = makeService();
      (global.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse(false, {}));

      await expect(service.getProfileByToken({ code: 'abc' })).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws when the token exchange response has no access_token', async () => {
      const service = makeService();
      (global.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse(true, {}));

      await expect(service.getProfileByToken({ code: 'abc' })).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws when the GitHub user response is not ok', async () => {
      const service = makeService();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(jsonResponse(true, { access_token: 'gh-access-token' }))
        .mockResolvedValueOnce(jsonResponse(false, {}));

      await expect(service.getProfileByToken({ code: 'abc' })).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws when the GitHub user payload has no id', async () => {
      const service = makeService();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(jsonResponse(true, { access_token: 'gh-access-token' }))
        .mockResolvedValueOnce(jsonResponse(true, {}));

      await expect(service.getProfileByToken({ code: 'abc' })).rejects.toThrow(UnprocessableEntityException);
    });

    it('returns a null email when fetching the primary email fails', async () => {
      const service = makeService();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(jsonResponse(true, { access_token: 'gh-access-token' }))
        .mockResolvedValueOnce(jsonResponse(true, { id: 42, login: 'octocat', name: 'Jane', email: null, avatar_url: 'a' }))
        .mockResolvedValueOnce(jsonResponse(false, {}));

      const result = await service.getProfileByToken({ code: 'abc' });

      expect(result.email).toBeNull();
    });

    it('returns a null email when fetching the primary email throws', async () => {
      const service = makeService();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(jsonResponse(true, { access_token: 'gh-access-token' }))
        .mockResolvedValueOnce(jsonResponse(true, { id: 42, login: 'octocat', name: 'Jane', email: null, avatar_url: 'a' }))
        .mockRejectedValueOnce(new Error('network down'));

      const result = await service.getProfileByToken({ code: 'abc' });

      expect(result.email).toBeNull();
    });
  });
});
