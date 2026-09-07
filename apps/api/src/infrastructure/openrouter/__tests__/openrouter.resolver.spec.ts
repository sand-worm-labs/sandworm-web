// OpenRouterResolver imports OpenRouterService, which constructs a real
// @openrouter/sdk client (ESM-only) at module load time — mock the SDK so
// jest never loads it.
jest.mock('@openrouter/sdk', () => ({ OpenRouter: jest.fn() }));
jest.mock('@openrouter/sdk/models/operations', () => ({
  CreateKeysLimitReset: { Monthly: 'monthly' },
}));

import { OpenRouterResolver } from '../openrouter.resolver';

function makeResolver() {
  const openRouterService = {
    getModels: jest.fn(),
    getModel: jest.fn(),
    getAccountCredits: jest.fn(),
  } as any;
  const resolver = new OpenRouterResolver(openRouterService);
  return { resolver, openRouterService };
}

describe('OpenRouterResolver', () => {
  describe('getModels', () => {
    it('delegates to OpenRouterService.getModels', async () => {
      const { resolver, openRouterService } = makeResolver();
      openRouterService.getModels.mockResolvedValue([{ id: 'm1' }]);

      await expect(resolver.getModels()).resolves.toEqual([{ id: 'm1' }]);
      expect(openRouterService.getModels).toHaveBeenCalled();
    });
  });

  describe('getModel', () => {
    it('delegates to OpenRouterService.getModel with the given id', async () => {
      const { resolver, openRouterService } = makeResolver();
      openRouterService.getModel.mockResolvedValue({ id: 'm1' });

      await expect(resolver.getModel('m1')).resolves.toEqual({ id: 'm1' });
      expect(openRouterService.getModel).toHaveBeenCalledWith('m1');
    });
  });

  describe('getAccountCredits', () => {
    it('delegates to OpenRouterService.getAccountCredits with userId and workspaceId', async () => {
      const { resolver, openRouterService } = makeResolver();
      openRouterService.getAccountCredits.mockResolvedValue({ totalCredits: 1, usedCredits: 0, availableCredits: 1 });

      await expect(resolver.getAccountCredits('u1', 'w1')).resolves.toEqual({
        totalCredits: 1,
        usedCredits: 0,
        availableCredits: 1,
      });
      expect(openRouterService.getAccountCredits).toHaveBeenCalledWith('w1', 'u1');
    });
  });
});
