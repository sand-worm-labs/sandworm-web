// verifyPassword drags in argon2 (a native binding) — stub just that export
// so tests control the pass/fail branches deterministically without hashing,
// while keeping the package's other exports (e.g. the Environment enum, which
// @sandworm/graphql's config validators need at import time) intact.
jest.mock('@sandworm/nest-common', () => ({
  ...jest.requireActual('@sandworm/nest-common'),
  verifyPassword: jest.fn(),
}));

import {
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { verifyPassword } from '@sandworm/nest-common';
import { AuthService } from '../auth.service';
import { AuthProvidersEnum } from '@/common/enums/auth-providers.enum';

const mockVerifyPassword = verifyPassword as jest.Mock;

const AUTH_CONFIG = {
  secret: 'access-secret',
  expires: '15m',
  refreshSecret: 'refresh-secret',
  refreshExpires: '7d',
  forgotSecret: 'forgot-secret',
  forgotExpires: '1h',
  confirmEmailSecret: 'confirm-secret',
  confirmEmailExpires: '1d',
};

function makeService() {
  const jwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  } as any;

  const usersService = {
    findByEmailWithPassword: jest.fn(),
    findByEmail: jest.fn(),
    findBySocialIdAndProvider: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    getUserWorkspaceRoles: jest.fn(),
    remove: jest.fn(),
  } as any;

  const mailService = {
    userSignUp: jest.fn(),
    forgotPassword: jest.fn(),
    confirmNewEmail: jest.fn(),
  } as any;

  const configService = {
    getOrThrow: jest.fn(() => AUTH_CONFIG),
  } as any;

  const service = new AuthService(jwtService, usersService, mailService, configService);
  return { service, jwtService, usersService, mailService, configService };
}

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('issueTokenPair', () => {
    it('signs access and refresh tokens with the configured secrets and expiry', async () => {
      const { service, jwtService } = makeService();
      jwtService.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');

      const result = await service.issueTokenPair('user-1');

      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        { sub: 'user-1' },
        { secret: AUTH_CONFIG.secret, expiresIn: AUTH_CONFIG.expires },
      );
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        { sub: 'user-1' },
        { secret: AUTH_CONFIG.refreshSecret, expiresIn: AUTH_CONFIG.refreshExpires },
      );
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.accessTokenExpires).toBeInstanceOf(Date);
      expect(result.refreshTokenExpires).toBeInstanceOf(Date);
    });

    it('falls back to default expiries when the auth config omits them', async () => {
      const { service, jwtService, configService } = makeService();
      configService.getOrThrow.mockReturnValue({ ...AUTH_CONFIG, expires: undefined, refreshExpires: undefined });
      jwtService.signAsync.mockResolvedValue('token');

      await service.issueTokenPair('user-1');

      expect(jwtService.signAsync).toHaveBeenNthCalledWith(1, expect.anything(), expect.objectContaining({ expiresIn: '15m' }));
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(2, expect.anything(), expect.objectContaining({ expiresIn: '7d' }));
    });
  });

  describe('validateLogin', () => {
    const loginDto = { email: 'a@b.com', password: 'pw' };

    it('throws when no user is found for the email', async () => {
      const { service, usersService } = makeService();
      usersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(service.validateLogin(loginDto)).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws when the user registered via a social provider', async () => {
      const { service, usersService } = makeService();
      usersService.findByEmailWithPassword.mockResolvedValue({
        id: 'u1',
        provider: AuthProvidersEnum.google,
        password: 'hash',
      });

      await expect(service.validateLogin(loginDto)).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws when the user has no password set', async () => {
      const { service, usersService } = makeService();
      usersService.findByEmailWithPassword.mockResolvedValue({
        id: 'u1',
        provider: AuthProvidersEnum.email,
        password: null,
      });

      await expect(service.validateLogin(loginDto)).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws when the password does not match', async () => {
      const { service, usersService } = makeService();
      usersService.findByEmailWithPassword.mockResolvedValue({
        id: 'u1',
        provider: AuthProvidersEnum.email,
        password: 'hash',
      });
      mockVerifyPassword.mockResolvedValue(false);

      await expect(service.validateLogin(loginDto)).rejects.toThrow(UnprocessableEntityException);
    });

    it('returns the user (without password) and roles on success', async () => {
      const { service, usersService } = makeService();
      const user = { id: 'u1', provider: AuthProvidersEnum.email, password: 'hash', email: loginDto.email };
      usersService.findByEmailWithPassword.mockResolvedValue(user);
      mockVerifyPassword.mockResolvedValue(true);
      usersService.getUserWorkspaceRoles.mockResolvedValue([{ role: 'owner' }]);

      const result = await service.validateLogin(loginDto);

      expect(result.user.password).toBeUndefined();
      expect(result.roles).toEqual([{ role: 'owner' }]);
    });
  });

  describe('validateSocialLogin', () => {
    const socialData = { id: 'social-1', email: 'Social@Example.com', avatar: 'avatar.png' };

    it('updates and returns an existing user found by social id', async () => {
      const { service, usersService } = makeService();
      const user = { id: 'u1', email: null, avatar: null };
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findBySocialIdAndProvider.mockResolvedValue(user);
      usersService.getUserWorkspaceRoles.mockResolvedValue([]);

      const result = await service.validateSocialLogin('github', socialData as any);

      expect(usersService.update).toHaveBeenCalledWith('u1', { avater: 'avatar.png' });
      expect(usersService.update).toHaveBeenCalledWith('u1', expect.objectContaining({ id: 'u1' }));
      expect(result.user.email).toBe('social@example.com');
      expect(result.user.avatar).toBe('avatar.png');
    });

    it('falls back to the user found by email when no social match exists', async () => {
      const { service, usersService } = makeService();
      const userByEmail = { id: 'u2', avatar: null };
      usersService.findByEmail.mockResolvedValue(userByEmail);
      usersService.findBySocialIdAndProvider.mockResolvedValue(null);
      usersService.getUserWorkspaceRoles.mockResolvedValue([]);

      const result = await service.validateSocialLogin('github', socialData as any);

      expect(usersService.update).toHaveBeenCalledWith('u2', { avater: 'avatar.png' });
      expect(result.user.id).toBe('u2');
    });

    it('creates a new user when neither social id nor email match', async () => {
      const { service, usersService } = makeService();
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findBySocialIdAndProvider.mockResolvedValue(null);
      usersService.create.mockResolvedValue({ id: 'u3' });
      usersService.findById.mockResolvedValue({ id: 'u3', email: 'social@example.com' });
      usersService.getUserWorkspaceRoles.mockResolvedValue([]);

      const result = await service.validateSocialLogin('github', socialData as any);

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ socialId: 'social-1', provider: 'github' }),
      );
      expect(result.user.id).toBe('u3');
    });

    it('throws when no user could be found or created', async () => {
      const { service, usersService } = makeService();
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.validateSocialLogin('github', { id: '' } as any)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('register', () => {
    it('creates the user, signs a confirm-email hash, and sends the sign-up email', async () => {
      const { service, usersService, jwtService, mailService } = makeService();
      usersService.create.mockResolvedValue({ id: 'u1' });
      jwtService.signAsync.mockResolvedValue('confirm-hash');

      await service.register({ email: 'a@b.com' } as any);

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { confirmEmailUserId: 'u1' },
        { secret: AUTH_CONFIG.confirmEmailSecret, expiresIn: AUTH_CONFIG.confirmEmailExpires },
      );
      expect(mailService.userSignUp).toHaveBeenCalledWith({ to: 'a@b.com', data: { hash: 'confirm-hash' } });
    });
  });

  describe('confirmEmail', () => {
    it('throws when the hash fails verification', async () => {
      const { service, jwtService } = makeService();
      jwtService.verifyAsync.mockRejectedValue(new Error('bad token'));

      await expect(service.confirmEmail('bad-hash')).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws NotFoundException when the user no longer exists', async () => {
      const { service, jwtService, usersService } = makeService();
      jwtService.verifyAsync.mockResolvedValue({ confirmEmailUserId: 'u1' });
      usersService.findById.mockResolvedValue(null);

      await expect(service.confirmEmail('hash')).rejects.toThrow(NotFoundException);
    });

    it('updates the user on success', async () => {
      const { service, jwtService, usersService } = makeService();
      jwtService.verifyAsync.mockResolvedValue({ confirmEmailUserId: 'u1' });
      usersService.findById.mockResolvedValue({ id: 'u1' });

      await service.confirmEmail('hash');

      expect(usersService.update).toHaveBeenCalledWith('u1', { id: 'u1' });
    });
  });

  describe('confirmNewEmail', () => {
    it('throws when the hash fails verification', async () => {
      const { service, jwtService } = makeService();
      jwtService.verifyAsync.mockRejectedValue(new Error('bad token'));

      await expect(service.confirmNewEmail('bad-hash')).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws NotFoundException when the user no longer exists', async () => {
      const { service, jwtService, usersService } = makeService();
      jwtService.verifyAsync.mockResolvedValue({ confirmEmailUserId: 'u1', newEmail: 'new@b.com' });
      usersService.findById.mockResolvedValue(null);

      await expect(service.confirmNewEmail('hash')).rejects.toThrow(NotFoundException);
    });

    it('updates the user email on success', async () => {
      const { service, jwtService, usersService } = makeService();
      jwtService.verifyAsync.mockResolvedValue({ confirmEmailUserId: 'u1', newEmail: 'new@b.com' });
      usersService.findById.mockResolvedValue({ id: 'u1', email: 'old@b.com' });

      await service.confirmNewEmail('hash');

      expect(usersService.update).toHaveBeenCalledWith('u1', expect.objectContaining({ email: 'new@b.com' }));
    });
  });

  describe('forgotPassword', () => {
    it('throws when the email does not exist', async () => {
      const { service, usersService } = makeService();
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.forgotPassword('missing@b.com')).rejects.toThrow(UnprocessableEntityException);
    });

    it('signs a forgot-password hash and sends the email', async () => {
      const { service, usersService, jwtService, mailService } = makeService();
      usersService.findByEmail.mockResolvedValue({ id: 'u1' });
      jwtService.signAsync.mockResolvedValue('forgot-hash');

      await service.forgotPassword('a@b.com');

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { forgotUserId: 'u1' },
        { secret: AUTH_CONFIG.forgotSecret, expiresIn: AUTH_CONFIG.forgotExpires },
      );
      expect(mailService.forgotPassword).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'a@b.com', data: expect.objectContaining({ hash: 'forgot-hash' }) }),
      );
    });
  });

  describe('resetPassword', () => {
    it('throws when the hash fails verification', async () => {
      const { service, jwtService } = makeService();
      jwtService.verifyAsync.mockRejectedValue(new Error('bad token'));

      await expect(service.resetPassword('bad-hash', 'newpw')).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws when the user no longer exists', async () => {
      const { service, jwtService, usersService } = makeService();
      jwtService.verifyAsync.mockResolvedValue({ forgotUserId: 'u1' });
      usersService.findById.mockResolvedValue(null);

      await expect(service.resetPassword('hash', 'newpw')).rejects.toThrow(UnprocessableEntityException);
    });

    it('sets the new password and bumps tokenVersion on success', async () => {
      const { service, jwtService, usersService } = makeService();
      jwtService.verifyAsync.mockResolvedValue({ forgotUserId: 'u1' });
      usersService.findById.mockResolvedValue({ id: 'u1', tokenVersion: 1 });

      await service.resetPassword('hash', 'newpw');

      expect(usersService.update).toHaveBeenCalledWith(
        'u1',
        expect.objectContaining({ password: 'newpw', tokenVersion: 2 }),
      );
    });
  });

  describe('me', () => {
    it('delegates to usersService.findById', async () => {
      const { service, usersService } = makeService();
      usersService.findById.mockResolvedValue({ id: 'u1' });

      const result = await service.me('u1');

      expect(usersService.findById).toHaveBeenCalledWith('u1');
      expect(result).toEqual({ id: 'u1' });
    });
  });

  describe('update', () => {
    it('throws when the current user cannot be found', async () => {
      const { service, usersService } = makeService();
      usersService.findById.mockResolvedValue(null);

      await expect(service.update('u1', {} as any)).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws when changing password without providing oldPassword', async () => {
      const { service, usersService } = makeService();
      usersService.findById.mockResolvedValue({ id: 'u1', password: 'hash' });

      await expect(service.update('u1', { password: 'new' } as any)).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws when the current user has no password on file', async () => {
      const { service, usersService } = makeService();
      usersService.findById.mockResolvedValue({ id: 'u1', password: null });

      await expect(
        service.update('u1', { password: 'new', oldPassword: 'old' } as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws when oldPassword is incorrect', async () => {
      const { service, usersService } = makeService();
      usersService.findById.mockResolvedValue({ id: 'u1', password: 'hash' });
      mockVerifyPassword.mockResolvedValue(false);

      await expect(
        service.update('u1', { password: 'new', oldPassword: 'wrong' } as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws when the new email is already taken by another user', async () => {
      const { service, usersService } = makeService();
      usersService.findById.mockResolvedValue({ id: 'u1', email: 'old@b.com' });
      usersService.findByEmail.mockResolvedValue({ id: 'u2' });

      await expect(service.update('u1', { email: 'new@b.com' } as any)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('sends a confirm-new-email mail and bumps tokenVersion when the email changes', async () => {
      const { service, usersService, jwtService, mailService } = makeService();
      usersService.findById.mockResolvedValueOnce({ id: 'u1', email: 'old@b.com', tokenVersion: 1 });
      usersService.findByEmail.mockResolvedValue(null);
      jwtService.signAsync.mockResolvedValue('confirm-hash');
      usersService.findById.mockResolvedValueOnce({ id: 'u1', email: 'new@b.com' });

      const dto = { email: 'new@b.com' } as any;
      const result = await service.update('u1', dto);

      expect(mailService.confirmNewEmail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'new@b.com', data: { hash: 'confirm-hash' } }),
      );
      expect(usersService.update).toHaveBeenCalledWith('u1', expect.not.objectContaining({ email: expect.anything() }));
      expect(result).toEqual({ id: 'u1', email: 'new@b.com' });
    });

    it('updates non-sensitive fields without touching email flow when email is unchanged', async () => {
      const { service, usersService, mailService } = makeService();
      usersService.findById
        .mockResolvedValueOnce({ id: 'u1', email: 'old@b.com' })
        .mockResolvedValueOnce({ id: 'u1', email: 'old@b.com', firstName: 'New' });

      const result = await service.update('u1', { firstName: 'New' } as any);

      expect(mailService.confirmNewEmail).not.toHaveBeenCalled();
      expect(usersService.update).toHaveBeenCalledWith('u1', { firstName: 'New' });
      expect(result).toEqual({ id: 'u1', email: 'old@b.com', firstName: 'New' });
    });
  });

  describe('refreshTokens', () => {
    it('throws UnauthorizedException when the refresh token is invalid', async () => {
      const { service, jwtService } = makeService();
      jwtService.verifyAsync.mockRejectedValue(new Error('expired'));

      await expect(service.refreshTokens('bad-token')).rejects.toThrow(UnauthorizedException);
    });

    it('issues a new token pair for the verified user', async () => {
      const { service, jwtService } = makeService();
      jwtService.verifyAsync.mockResolvedValue({ sub: 'u1' });
      jwtService.signAsync.mockResolvedValue('token');

      const result = await service.refreshTokens('good-token');

      expect(result.accessToken).toBe('token');
    });
  });

  describe('softDelete', () => {
    it('removes the user', async () => {
      const { service, usersService } = makeService();

      await service.softDelete({ id: 'u1' } as any);

      expect(usersService.remove).toHaveBeenCalledWith('u1');
    });
  });

  describe('verifyAccessToken', () => {
    it('throws UnauthorizedException when the token is invalid', async () => {
      const { service, jwtService } = makeService();
      jwtService.verifyAsync.mockRejectedValue(new Error('bad'));

      await expect(service.verifyAccessToken('bad')).rejects.toThrow(UnauthorizedException);
    });

    it('returns the decoded payload on success', async () => {
      const { service, jwtService } = makeService();
      const payload = { id: 'u1', sub: 'u1', iat: 1, exp: 2 };
      jwtService.verifyAsync.mockResolvedValue(payload);

      const result = await service.verifyAccessToken('good');

      expect(result).toEqual(payload);
    });
  });

  describe('validateTokenAndGetUser', () => {
    it('returns null when the token fails verification', async () => {
      const { service, jwtService } = makeService();
      jwtService.verifyAsync.mockRejectedValue(new Error('bad'));

      const result = await service.validateTokenAndGetUser('bad');

      expect(result).toBeNull();
    });

    it('returns null when the user no longer exists', async () => {
      const { service, jwtService, usersService } = makeService();
      jwtService.verifyAsync.mockResolvedValue({ sub: 'u1' });
      usersService.findById.mockResolvedValue(null);

      const result = await service.validateTokenAndGetUser('good');

      expect(result).toBeNull();
    });

    it('returns the session on success', async () => {
      const { service, jwtService, usersService } = makeService();
      jwtService.verifyAsync.mockResolvedValue({ sub: 'u1' });
      usersService.findById.mockResolvedValue({ id: 'u1' });
      usersService.getUserWorkspaceRoles.mockResolvedValue([{ role: 'owner' }]);

      const result = await service.validateTokenAndGetUser('good');

      expect(result).toEqual({ id: 'u1', hash: 'good', user: { id: 'u1' }, roles: [{ role: 'owner' }] });
    });
  });
});
