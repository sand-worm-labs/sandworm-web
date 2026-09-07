import { UnauthorizedException } from '@nestjs/common';
import { JwtRefreshStrategy } from '../strategies/jwt-refresh.strategy';

function makeStrategy() {
  const configService = {
    getOrThrow: jest.fn(() => ({ refreshSecret: 'refresh-secret' })),
  } as any;

  return new JwtRefreshStrategy(configService);
}

describe('JwtRefreshStrategy', () => {
  describe('validate', () => {
    it('throws UnauthorizedException when the payload has no id', () => {
      const strategy = makeStrategy();

      expect(() => strategy.validate({ hash: 'h1' } as any)).toThrow(UnauthorizedException);
    });

    it('returns the payload unchanged when it has an id', () => {
      const strategy = makeStrategy();
      const payload = { id: 'u1', hash: 'h1', iat: 1, exp: 2 };

      expect(strategy.validate(payload)).toEqual(payload);
    });
  });
});
