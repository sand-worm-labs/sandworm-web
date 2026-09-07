import { AnonymousStrategy } from '../strategies/anonymous.strategy';

describe('AnonymousStrategy', () => {
  describe('validate', () => {
    it('returns the request unchanged, ignoring the payload', () => {
      const strategy = new AnonymousStrategy();
      const request = { headers: {} };

      expect(strategy.validate(undefined, request)).toBe(request);
    });
  });
});
