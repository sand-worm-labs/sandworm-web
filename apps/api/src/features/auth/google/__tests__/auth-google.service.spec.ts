// OAuth2Client wraps real network calls to Google's token/verify endpoints —
// stub it so tests never hit the network and can control each branch.
const mockGetToken = jest.fn();
const mockVerifyIdToken = jest.fn();
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    getToken: mockGetToken,
    verifyIdToken: mockVerifyIdToken,
  })),
}));

import { UnprocessableEntityException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { AuthGoogleService } from '../auth-google.service';

const GOOGLE_CONFIG = { clientId: 'client-id', clientSecret: 'client-secret' };

function makeService() {
  const configService = {
    get: jest.fn(() => GOOGLE_CONFIG),
    getOrThrow: jest.fn(() => GOOGLE_CONFIG),
  } as any;

  return new AuthGoogleService(configService);
}

describe('AuthGoogleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('constructs the OAuth2Client with the configured client id and secret', () => {
    makeService();

    expect(OAuth2Client).toHaveBeenCalledWith(GOOGLE_CONFIG.clientId, GOOGLE_CONFIG.clientSecret);
  });

  describe('getProfileByToken', () => {
    it('exchanges the code, verifies the id token, and returns the mapped social data', async () => {
      const service = makeService();
      mockGetToken.mockResolvedValue({ tokens: { id_token: 'id-token' } });
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          sub: 'google-1',
          email: 'a@b.com',
          given_name: 'Jane',
          family_name: 'Doe',
          picture: 'https://avatar/jane.png',
        }),
      });

      const result = await service.getProfileByToken({ code: 'abc' });

      expect(mockGetToken).toHaveBeenCalledWith({ code: 'abc', redirect_uri: 'postmessage' });
      expect(mockVerifyIdToken).toHaveBeenCalledWith({ idToken: 'id-token', audience: [GOOGLE_CONFIG.clientId] });
      expect(result).toEqual({
        id: 'google-1',
        email: 'a@b.com',
        firstName: 'Jane',
        lastName: 'Doe',
        avatar: 'https://avatar/jane.png',
      });
    });

    it('throws when exchanging the code fails', async () => {
      const service = makeService();
      mockGetToken.mockRejectedValue(new Error('bad code'));

      await expect(service.getProfileByToken({ code: 'abc' })).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws when the token exchange yields no id_token', async () => {
      const service = makeService();
      mockGetToken.mockResolvedValue({ tokens: {} });

      await expect(service.getProfileByToken({ code: 'abc' })).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws when the id token has no payload', async () => {
      const service = makeService();
      mockGetToken.mockResolvedValue({ tokens: { id_token: 'id-token' } });
      mockVerifyIdToken.mockResolvedValue({ getPayload: () => undefined });

      await expect(service.getProfileByToken({ code: 'abc' })).rejects.toThrow(UnprocessableEntityException);
    });
  });
});
