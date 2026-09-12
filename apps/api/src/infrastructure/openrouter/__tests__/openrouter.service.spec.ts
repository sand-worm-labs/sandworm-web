// @openrouter/sdk is a real API client hitting OpenRouter's servers — mock
// it entirely (both the client class and its operations submodule) so
// jest never performs a real network call or loads the ESM-only SDK.
const mockApiKeys = {
  create: jest.fn(),
  get: jest.fn(),
  list: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getCurrentKeyMetadata: jest.fn(),
};
const mockModels = { list: jest.fn() };

jest.mock('@openrouter/sdk', () => ({
  OpenRouter: jest.fn().mockImplementation(() => ({
    apiKeys: mockApiKeys,
    models: mockModels,
  })),
}));

jest.mock('@openrouter/sdk/models/operations', () => ({
  CreateKeysLimitReset: { Monthly: 'monthly', Daily: 'daily', Weekly: 'weekly' },
}));

jest.mock('@openrouter/sdk/models/errors', () => ({
  NotFoundResponseError: class MockNotFoundResponseError extends Error {},
}));

import { NotFoundException } from '@nestjs/common';
import { OpenRouter } from '@openrouter/sdk';
import { NotFoundResponseError } from '@openrouter/sdk/models/errors';
import { OpenRouterService } from '../openrouter.service';

const WORKSPACE_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const USER_ID = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

function makeService(configValues: Record<string, unknown> = {}) {
  const configService = {
    getOrThrow: jest.fn((key: string) => (key === 'openrouter.provisioningKey' ? 'prov-key' : configValues[key])),
    get: jest.fn(() => configValues.openrouter ?? { defaultCap: undefined, limitReset: undefined }),
  } as any;
  const workspaceRepository = { findOne: jest.fn() } as any;
  const environmentService = {
    getEnvironmentVariable: jest.fn(),
    setEnvironmentVariables: jest.fn(),
  } as any;
  const workspaceMembershipService = { assertActiveMember: jest.fn() } as any;

  const service = new OpenRouterService(
    configService,
    workspaceRepository,
    environmentService,
    workspaceMembershipService,
  );
  return { service, configService, workspaceRepository, environmentService, workspaceMembershipService };
}

describe('OpenRouterService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('constructor', () => {
    it('constructs the OpenRouter client with the provisioning key from config', () => {
      makeService();

      expect(OpenRouter).toHaveBeenCalledWith({ apiKey: 'prov-key' });
    });
  });

  describe('provisionKey', () => {
    it('creates a key with the default cap and monthly reset when unset', async () => {
      const { service } = makeService();
      mockApiKeys.create.mockResolvedValue({ data: { hash: 'h1' } });

      const result = await service.provisionKey(WORKSPACE_ID);

      expect(mockApiKeys.create).toHaveBeenCalledWith({
        requestBody: { name: `workspace-${WORKSPACE_ID}`, limit: 2.0, limitReset: 'monthly' },
      });
      expect(result).toEqual({ data: { hash: 'h1' } });
    });

    it('uses the provided limit when given', async () => {
      const { service } = makeService();
      mockApiKeys.create.mockResolvedValue({ data: {} });

      await service.provisionKey(WORKSPACE_ID, 5);

      expect(mockApiKeys.create).toHaveBeenCalledWith(
        expect.objectContaining({ requestBody: expect.objectContaining({ limit: 5 }) }),
      );
    });

    it('tags SDK errors with an [OpenRouter] prefix', async () => {
      const { service } = makeService();
      mockApiKeys.create.mockRejectedValue(new Error('bad key'));

      await expect(service.provisionKey(WORKSPACE_ID)).rejects.toThrow('[OpenRouter] bad key');
    });
  });

  describe('getKey', () => {
    it('fetches the key by hash', async () => {
      const { service } = makeService();
      mockApiKeys.get.mockResolvedValue({ data: { hash: 'h1' } });

      await expect(service.getKey('h1')).resolves.toEqual({ data: { hash: 'h1' } });
      expect(mockApiKeys.get).toHaveBeenCalledWith({ hash: 'h1' });
    });

    it('tags SDK errors', async () => {
      const { service } = makeService();
      mockApiKeys.get.mockRejectedValue(new Error('not found'));

      await expect(service.getKey('h1')).rejects.toThrow('[OpenRouter] not found');
    });
  });

  describe('listKeys', () => {
    it('lists keys with the given offset', async () => {
      const { service } = makeService();
      mockApiKeys.list.mockResolvedValue({ data: [] });

      await service.listKeys('cursor1');

      expect(mockApiKeys.list).toHaveBeenCalledWith({ offset: 'cursor1' });
    });
  });

  describe('updateKey', () => {
    it('updates the key with the given data', async () => {
      const { service } = makeService();
      mockApiKeys.update.mockResolvedValue({ data: {} });

      await service.updateKey('h1', { limit: 10 });

      expect(mockApiKeys.update).toHaveBeenCalledWith({ hash: 'h1', requestBody: { limit: 10 } });
    });
  });

  describe('revokeKey', () => {
    it('deletes the key and swallows errors with a warning log', async () => {
      const { service } = makeService();
      mockApiKeys.delete.mockRejectedValue(new Error('gone'));

      await expect(service.revokeKey('h1')).resolves.toBeUndefined();
      expect(mockApiKeys.delete).toHaveBeenCalledWith({ hash: 'h1' });
    });
  });

  describe('validateUserKey', () => {
    it('returns true when the key metadata call succeeds', async () => {
      const { service } = makeService();
      mockApiKeys.getCurrentKeyMetadata.mockResolvedValue({ data: {} });

      await expect(service.validateUserKey('user-key')).resolves.toBe(true);
      expect(OpenRouter).toHaveBeenCalledWith({ apiKey: 'user-key' });
    });

    it('returns false when the key metadata call fails', async () => {
      const { service } = makeService();
      mockApiKeys.getCurrentKeyMetadata.mockRejectedValue(new Error('invalid'));

      await expect(service.validateUserKey('bad-key')).resolves.toBe(false);
    });
  });

  describe('getAccountCredits', () => {
    it('returns zeroed credits when the workspace has no AI key configured', async () => {
      const { service, workspaceRepository, environmentService, workspaceMembershipService } = makeService();
      workspaceRepository.findOne.mockResolvedValue({ id: WORKSPACE_ID });
      environmentService.getEnvironmentVariable.mockResolvedValue(null);

      const result = await service.getAccountCredits(WORKSPACE_ID, USER_ID);

      expect(workspaceMembershipService.assertActiveMember).toHaveBeenCalledWith(WORKSPACE_ID, USER_ID);
      expect(result).toEqual({ totalCredits: 0, usedCredits: 0, availableCredits: 0 });
    });

    it('returns credits derived from the OpenRouter key when configured', async () => {
      const { service, workspaceRepository, environmentService } = makeService();
      workspaceRepository.findOne.mockResolvedValue({ id: WORKSPACE_ID });
      environmentService.getEnvironmentVariable.mockResolvedValue({ value: 'wk-hash' });
      mockApiKeys.get.mockResolvedValue({ data: { limit: 10, usage: 4, limitRemaining: 6 } });

      const result = await service.getAccountCredits(WORKSPACE_ID, USER_ID);

      expect(mockApiKeys.get).toHaveBeenCalledWith({ hash: 'wk-hash' });
      expect(result).toEqual({ totalCredits: 10, usedCredits: 4, availableCredits: 6 });
    });

    it('throws NotFoundException when the workspace does not exist', async () => {
      const { service, workspaceRepository } = makeService();
      workspaceRepository.findOne.mockResolvedValue(null);

      await expect(service.getAccountCredits(WORKSPACE_ID, USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('tags SDK errors when fetching the key fails', async () => {
      const { service, workspaceRepository, environmentService } = makeService();
      workspaceRepository.findOne.mockResolvedValue({ id: WORKSPACE_ID });
      environmentService.getEnvironmentVariable.mockResolvedValue({ value: 'wk-hash' });
      mockApiKeys.get.mockRejectedValue(new Error('rate limited'));

      await expect(service.getAccountCredits(WORKSPACE_ID, USER_ID)).rejects.toThrow('[OpenRouter] rate limited');
    });

    it('re-provisions and retries when the stored hash no longer exists on OpenRouter', async () => {
      const { service, workspaceRepository, environmentService } = makeService();
      workspaceRepository.findOne.mockResolvedValue({ id: WORKSPACE_ID });
      environmentService.getEnvironmentVariable.mockResolvedValue({ value: 'stale-hash' });
      mockApiKeys.get
        .mockRejectedValueOnce(new (NotFoundResponseError as unknown as new () => NotFoundResponseError)())
        .mockResolvedValueOnce({ data: { limit: 10, usage: 1, limitRemaining: 9 } });
      mockApiKeys.create.mockResolvedValue({ key: 'new-key', data: { hash: 'fresh-hash' } });

      const result = await service.getAccountCredits(WORKSPACE_ID, USER_ID);

      expect(mockApiKeys.get).toHaveBeenNthCalledWith(1, { hash: 'stale-hash' });
      expect(mockApiKeys.get).toHaveBeenNthCalledWith(2, { hash: 'fresh-hash' });
      expect(environmentService.setEnvironmentVariables).toHaveBeenCalledWith(WORKSPACE_ID, {
        add: [
          { name: 'OPENROUTER_API_KEY', value: 'new-key' },
          { name: 'OPENROUTER_API_KEY_HASH', value: 'fresh-hash' },
        ],
        remove: [],
      });
      expect(result).toEqual({ totalCredits: 10, usedCredits: 1, availableCredits: 9 });
    });

    it('tags the error when re-provisioning still fails to produce a usable key', async () => {
      const { service, workspaceRepository, environmentService } = makeService();
      workspaceRepository.findOne.mockResolvedValue({ id: WORKSPACE_ID });
      environmentService.getEnvironmentVariable.mockResolvedValue({ value: 'stale-hash' });
      mockApiKeys.get
        .mockRejectedValueOnce(new (NotFoundResponseError as unknown as new () => NotFoundResponseError)())
        .mockRejectedValueOnce(new Error('still missing'));
      mockApiKeys.create.mockResolvedValue({ key: 'new-key', data: { hash: 'fresh-hash' } });

      await expect(service.getAccountCredits(WORKSPACE_ID, USER_ID)).rejects.toThrow('[OpenRouter] still missing');
    });
  });

  describe('getModels', () => {
    it('maps the SDK response into OpenRouterModel entries', async () => {
      const { service } = makeService();
      mockModels.list.mockResolvedValue({
        data: [{ id: 'm1', name: 'Model One', contextLength: 1000 }],
      });

      const result = await service.getModels();

      expect(result).toEqual([{ id: 'm1', name: 'Model One', details: { contextLength: 1000 } }]);
    });

    it('tags SDK errors', async () => {
      const { service } = makeService();
      mockModels.list.mockRejectedValue(new Error('down'));

      await expect(service.getModels()).rejects.toThrow('[OpenRouter] down');
    });
  });

  describe('getModel', () => {
    it('returns the matching model from getModels', async () => {
      const { service } = makeService();
      mockModels.list.mockResolvedValue({ data: [{ id: 'm1', name: 'Model One' }] });

      await expect(service.getModel('m1')).resolves.toEqual({ id: 'm1', name: 'Model One', details: {} });
    });

    it('returns null when no model matches', async () => {
      const { service } = makeService();
      mockModels.list.mockResolvedValue({ data: [{ id: 'm1', name: 'Model One' }] });

      await expect(service.getModel('missing')).resolves.toBeNull();
    });
  });

  describe('getScopedClient', () => {
    it('constructs a new OpenRouter client scoped to the given key', () => {
      const { service } = makeService();

      const client = service.getScopedClient('scoped-key');

      expect(OpenRouter).toHaveBeenCalledWith({ apiKey: 'scoped-key' });
      expect(client).toBeDefined();
    });
  });

  describe('resolveKey', () => {
    it('prefers the workspace-owned key over the provisioned key', () => {
      const { service } = makeService();

      expect(service.resolveKey({ ownApiKey: 'own', provisionedKey: 'prov' })).toBe('own');
    });

    it('falls back to the provisioned key when no own key is set', () => {
      const { service } = makeService();

      expect(service.resolveKey({ ownApiKey: null, provisionedKey: 'prov' })).toBe('prov');
    });

    it('returns null when neither key is set', () => {
      const { service } = makeService();

      expect(service.resolveKey({})).toBeNull();
    });
  });
});
