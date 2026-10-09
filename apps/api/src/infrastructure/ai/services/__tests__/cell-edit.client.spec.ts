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
import { CellEditClient } from '../cell-edit.client';
import { MarkdownGeneratorService } from '../markdown-generator.service';
import { PythonGeneratorService } from '../python-generator.service';
import { SqlGeneratorService } from '../sql-generator.service';

const AI_CONFIG = { url: 'http://ai.local', handshakeToken: 'token-123' };
const CONTEXT = { user_id: 'u1', workspace_id: 'w1', document_id: 'd1' };
const RESULT = { cell_id: 'b1', updated: true };

function makeClient() {
  const configService = { getOrThrow: jest.fn(() => AI_CONFIG) } as any;
  const httpService = { post: jest.fn(() => of({ data: RESULT })) } as any;
  const workspaceService = {
    getWorkspaceById: jest.fn().mockResolvedValue({ id: 'w1', assistantModel: 'gpt-5' }),
    getWorkspaceAiKey: jest.fn().mockResolvedValue('sk-abc'),
  } as any;
  const authService = { issueTokenPair: jest.fn().mockResolvedValue({ accessToken: 'user-token' }) } as any;
  const client = new CellEditClient(configService, httpService, workspaceService, authService);
  return { client, httpService, authService };
}

const HEADERS = { headers: { 'Content-Type': 'application/json', 'x-handshake-token': 'token-123' } };

describe('CellEditClient', () => {
  it('asks the AI service to edit a cell, sending the cell id and the users own token', async () => {
    const { client, httpService, authService } = makeClient();

    const result = await client.edit('code', CONTEXT, 'b1', 'print one');

    expect(authService.issueTokenPair).toHaveBeenCalledWith('u1');
    expect(httpService.post).toHaveBeenCalledWith(
      'http://ai.local/code/edit',
      {
        prompt: 'print one',
        block_id: 'b1',
        openrouter_api_key: 'sk-abc',
        model: 'gpt-5',
        context: { ...CONTEXT, user_token: 'user-token' },
      },
      HEADERS,
    );
    // no text comes back to apply: only that the cell was changed
    expect(result).toEqual(RESULT);
  });

  it('asks for a fix with the error message', async () => {
    const { client, httpService } = makeClient();

    await client.fix('sql', CONTEXT, 'b1', 'syntax error');

    expect(httpService.post).toHaveBeenCalledWith(
      'http://ai.local/sql/fix',
      expect.objectContaining({ error_message: 'syntax error', block_id: 'b1' }),
      HEADERS,
    );
  });

  it('propagates an error when the AI service fails', async () => {
    const { client, httpService } = makeClient();
    httpService.post.mockReturnValue(throwError(() => new Error('network down')));

    await expect(client.edit('markdown', CONTEXT, 'b1', 'x')).rejects.toThrow('network down');
  });
});

describe('generator services', () => {
  it('each sends its own cell type to the client', async () => {
    const cells = { edit: jest.fn().mockResolvedValue(RESULT), fix: jest.fn().mockResolvedValue(RESULT) } as any;

    await new PythonGeneratorService(cells).edit(CONTEXT, 'b1', 'p');
    await new PythonGeneratorService(cells).fix(CONTEXT, 'b1', 'e');
    await new SqlGeneratorService(cells).edit(CONTEXT, 'b1', 'p');
    await new SqlGeneratorService(cells).fix(CONTEXT, 'b1', 'e');
    await new MarkdownGeneratorService(cells).edit(CONTEXT, 'b1', 'p');

    expect(cells.edit.mock.calls.map((c: unknown[]) => c[0])).toEqual(['code', 'sql', 'markdown']);
    expect(cells.fix.mock.calls.map((c: unknown[]) => c[0])).toEqual(['code', 'sql']);
  });
});
