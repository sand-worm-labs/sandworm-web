// WorkspaceService transitively drags in OpenRouterService (@openrouter/sdk,
// ESM-only) and JupyterService (@jupyterlab/services) — stub it via an
// explicit factory so jest never loads the real module chain.
jest.mock('@/features/workspace/service/workspace.service', () => ({
  WorkspaceService: jest.fn(),
}));
jest.mock('@/features/auth/core/auth.service', () => ({
  AuthService: jest.fn(),
}));

import { of, throwError } from 'rxjs';
import { TitleGeneratorService } from '../title-generator.service';

const AI_CONFIG = { url: 'http://ai.local', handshakeToken: 'token-123' };

function makeService() {
  const configService = { getOrThrow: jest.fn(() => AI_CONFIG) } as any;
  const httpService = { post: jest.fn() } as any;
  const workspaceService = {
    getWorkspaceById: jest.fn(),
    getWorkspaceAiKey: jest.fn(),
  } as any;
  const authService = { issueTokenPair: jest.fn().mockResolvedValue({ accessToken: 'user-token' }) } as any;

  const service = new TitleGeneratorService(configService, httpService, workspaceService, authService);
  return { service, httpService, workspaceService, authService };
}

const REQUEST = { user_id: 'u1', workspace_id: 'w1', document_id: 'd1' };

describe('TitleGeneratorService', () => {
  describe('generateTitle', () => {
    it('posts to /notebook/title as the user, with the workspace model', async () => {
      const { service, httpService, workspaceService, authService } = makeService();
      workspaceService.getWorkspaceById.mockResolvedValue({ id: 'w1', assistantModel: 'gpt-5' });
      workspaceService.getWorkspaceAiKey.mockResolvedValue('sk-abc');
      httpService.post.mockReturnValue(of({ data: { title: 'New Title' } }));

      const result = await service.generateTitle(REQUEST);

      expect(authService.issueTokenPair).toHaveBeenCalledWith('u1');
      expect(httpService.post).toHaveBeenCalledWith(
        'http://ai.local/notebook/title',
        {
          openrouter_api_key: 'sk-abc',
          model: 'gpt-5',
          context: { ...REQUEST, user_token: 'user-token' },
        },
        { headers: { 'Content-Type': 'application/json', 'x-handshake-token': 'token-123' } },
      );
      expect(result).toEqual({ title: 'New Title' });
    });

    it('propagates an error when the HTTP call fails', async () => {
      const { service, httpService, workspaceService } = makeService();
      workspaceService.getWorkspaceById.mockResolvedValue({ id: 'w1', assistantModel: 'gpt-5' });
      workspaceService.getWorkspaceAiKey.mockResolvedValue('sk-abc');
      httpService.post.mockReturnValue(throwError(() => new Error('network down')));

      await expect(service.generateTitle(REQUEST)).rejects.toThrow('network down');
    });
  });
});
