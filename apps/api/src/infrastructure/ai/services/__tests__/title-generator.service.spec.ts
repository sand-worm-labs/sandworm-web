// WorkspaceService transitively drags in OpenRouterService (@openrouter/sdk,
// ESM-only) and JupyterService (@jupyterlab/services) — stub it via an
// explicit factory so jest never loads the real module chain.
jest.mock('@/features/workspace/service/workspace.service', () => ({
  WorkspaceService: jest.fn(),
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

  const service = new TitleGeneratorService(configService, httpService, workspaceService);
  return { service, configService, httpService, workspaceService };
}

const REQUEST = { user_id: 'u1', workspace_id: 'w1', document_id: 'd1' };

describe('TitleGeneratorService', () => {
  describe('generateTitle', () => {
    it('posts to /document/generate-title with the change-title message and workspace model', async () => {
      const { service, httpService, workspaceService } = makeService();
      workspaceService.getWorkspaceById.mockResolvedValue({ id: 'w1', assistantModel: 'gpt-5' });
      workspaceService.getWorkspaceAiKey.mockResolvedValue('sk-abc');
      httpService.post.mockReturnValue(of({ data: { title: 'New Title' } }));

      const result = await service.generateTitle(REQUEST, 'Old Title');

      expect(httpService.post).toHaveBeenCalledWith(
        'http://ai.local/document/generate-title',
        {
          openrouter_api_key: 'sk-abc',
          message: 'Change the title of the document: Old Title',
          model: 'gpt-5',
          context: REQUEST,
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

      await expect(service.generateTitle(REQUEST, 'Old Title')).rejects.toThrow('network down');
    });
  });
});
