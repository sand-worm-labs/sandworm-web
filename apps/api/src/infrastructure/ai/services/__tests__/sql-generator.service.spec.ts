// WorkspaceService transitively drags in OpenRouterService (@openrouter/sdk,
// ESM-only) and JupyterService (@jupyterlab/services) — stub it via an
// explicit factory so jest never loads the real module chain.
jest.mock('@/features/workspace/service/workspace.service', () => ({
  WorkspaceService: jest.fn(),
}));

import { of, throwError } from 'rxjs';
import { SqlGeneratorService } from '../sql-generator.service';

const AI_CONFIG = { url: 'http://ai.local', handshakeToken: 'token-123' };

function makeService() {
  const configService = { getOrThrow: jest.fn(() => AI_CONFIG) } as any;
  const httpService = { post: jest.fn() } as any;
  const workspaceService = {
    getWorkspaceById: jest.fn(),
    getWorkspaceAiKey: jest.fn(),
  } as any;

  const service = new SqlGeneratorService(configService, httpService, workspaceService);
  return { service, configService, httpService, workspaceService };
}

const CONTEXT = { user_id: 'u1', workspace_id: 'w1', document_id: 'd1' };

describe('SqlGeneratorService', () => {
  describe('edit', () => {
    it('posts to /sql/edit with workspace model and api key, returning the response data', async () => {
      const { service, httpService, workspaceService } = makeService();
      workspaceService.getWorkspaceById.mockResolvedValue({ id: 'w1', assistantModel: 'gpt-5' });
      workspaceService.getWorkspaceAiKey.mockResolvedValue('sk-abc');
      httpService.post.mockReturnValue(of({ data: { code: 'SELECT 1' } }));

      const result = await service.edit(CONTEXT, 'add a filter');

      expect(httpService.post).toHaveBeenCalledWith(
        'http://ai.local/sql/edit',
        {
          openrouter_api_key: 'sk-abc',
          prompt: 'add a filter',
          model: 'gpt-5',
          context: CONTEXT,
        },
        { headers: { 'Content-Type': 'application/json', 'x-handshake-token': 'token-123' } },
      );
      expect(result).toEqual({ code: 'SELECT 1' });
    });

    it('propagates an error when the HTTP call fails', async () => {
      const { service, httpService, workspaceService } = makeService();
      workspaceService.getWorkspaceById.mockResolvedValue({ id: 'w1', assistantModel: 'gpt-5' });
      workspaceService.getWorkspaceAiKey.mockResolvedValue('sk-abc');
      httpService.post.mockReturnValue(throwError(() => new Error('network down')));

      await expect(service.edit(CONTEXT, 'add a filter')).rejects.toThrow('network down');
    });
  });

  describe('fix', () => {
    it('posts to /sql/fix with the error message, returning the response data', async () => {
      const { service, httpService, workspaceService } = makeService();
      workspaceService.getWorkspaceById.mockResolvedValue({ id: 'w1', assistantModel: 'gpt-5' });
      workspaceService.getWorkspaceAiKey.mockResolvedValue('sk-abc');
      httpService.post.mockReturnValue(of({ data: { code: 'SELECT 2' } }));

      const result = await service.fix(CONTEXT, 'syntax error');

      expect(httpService.post).toHaveBeenCalledWith(
        'http://ai.local/sql/fix',
        {
          openrouter_api_key: 'sk-abc',
          error_message: 'syntax error',
          model: 'gpt-5',
          context: CONTEXT,
        },
        { headers: { 'Content-Type': 'application/json', 'x-handshake-token': 'token-123' } },
      );
      expect(result).toEqual({ code: 'SELECT 2' });
    });

    it('propagates an error when the HTTP call fails', async () => {
      const { service, httpService, workspaceService } = makeService();
      workspaceService.getWorkspaceById.mockResolvedValue({ id: 'w1', assistantModel: 'gpt-5' });
      workspaceService.getWorkspaceAiKey.mockResolvedValue('sk-abc');
      httpService.post.mockReturnValue(throwError(() => new Error('boom')));

      await expect(service.fix(CONTEXT, 'syntax error')).rejects.toThrow('boom');
    });
  });
});
