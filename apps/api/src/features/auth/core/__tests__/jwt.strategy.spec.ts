import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from '../strategies/jwt.strategy';

function makeStrategy() {
  const configService = {
    getOrThrow: jest.fn(() => ({ secret: 'access-secret' })),
  } as any;

  return new JwtStrategy(configService);
}

describe('JwtStrategy', () => {
  describe('validate', () => {
    it('throws UnauthorizedException when the payload has no id', () => {
      const strategy = makeStrategy();

      expect(() => strategy.validate({ sub: 'u1' } as any)).toThrow(UnauthorizedException);
    });

    it('returns the payload unchanged when it has an id', () => {
      const strategy = makeStrategy();
      const payload = { id: 'u1', sub: 'u1', iat: 1, exp: 2 };

      expect(strategy.validate(payload)).toEqual(payload);
    });
  });
});
