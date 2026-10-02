import { McpOauthController } from '../mcp-oauth.controller';

// The real WorkspaceService drags in an ESM-only SDK that jest can't parse; the
// controller only needs the class as an injection token here.
jest.mock('@/features/workspace/service/workspace.service', () => ({ WorkspaceService: class {} }));

// The consent page posts here. What matters: the chosen workspace becomes the
// user's default only on "allow", and a bad workspace never blocks the flow.
const PARAMS = { redirectUri: 'http://localhost:6274/cb', state: 'xyz' };

function setup(switchWorkspace: jest.Mock = jest.fn().mockResolvedValue(true)) {
  const mcpOauth = {
    validateAuthorizeParams: jest.fn().mockResolvedValue(PARAMS),
    issueCode: jest.fn().mockResolvedValue('the-code'),
  } as any;
  const authService = { validateTokenAndGetUser: jest.fn().mockResolvedValue({ id: 'user-1' }) } as any;
  const controller = new McpOauthController(mcpOauth, authService, { switchWorkspace } as any, {} as any);
  const reply = { send: jest.fn(), status: jest.fn().mockReturnThis() } as any;
  const req = { cookies: { access_token: 'tok' } } as any;
  return { controller, reply, req, mcpOauth, switchWorkspace };
}

describe('McpOauthController.confirm', () => {
  it('switches to the chosen workspace and issues a code on allow', async () => {
    const { controller, reply, req, switchWorkspace, mcpOauth } = setup();
    await controller.confirm({ decision: 'allow', workspace_id: 'ws-2' }, req, reply);

    expect(switchWorkspace).toHaveBeenCalledWith('user-1', 'ws-2');
    expect(mcpOauth.issueCode).toHaveBeenCalled();
    expect(reply.send).toHaveBeenCalledWith({ redirectTo: 'http://localhost:6274/cb?code=the-code&state=xyz' });
  });

  it('does not touch the workspace on deny', async () => {
    const { controller, reply, req, switchWorkspace, mcpOauth } = setup();
    await controller.confirm({ decision: 'deny', workspace_id: 'ws-2' }, req, reply);

    expect(switchWorkspace).not.toHaveBeenCalled();
    expect(mcpOauth.issueCode).not.toHaveBeenCalled();
    expect(reply.send).toHaveBeenCalledWith({ redirectTo: 'http://localhost:6274/cb?error=access_denied&state=xyz' });
  });

  it('still authorizes when the workspace switch fails', async () => {
    const { controller, reply, req } = setup(jest.fn().mockRejectedValue(new Error('not a member')));
    await controller.confirm({ decision: 'allow', workspace_id: 'nope' }, req, reply);

    expect(reply.send).toHaveBeenCalledWith({ redirectTo: 'http://localhost:6274/cb?code=the-code&state=xyz' });
  });

  it('answers 401 when the session is gone', async () => {
    const { controller, reply, mcpOauth } = setup();
    await controller.confirm({ decision: 'allow' }, { cookies: {} } as any, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(mcpOauth.issueCode).not.toHaveBeenCalled();
  });
});

describe('McpOauthController.token', () => {
  const tokens = { accessToken: 'a', refreshToken: 'r', expiresIn: 900 };

  function tokenSetup(mcpOauth: object) {
    const controller = new McpOauthController(mcpOauth as any, {} as any, {} as any, {} as any);
    const reply = { send: jest.fn(), status: jest.fn().mockReturnThis() } as any;
    return { controller, reply };
  }

  it('answers a refresh_token grant with a new token pair', async () => {
    const refresh = jest.fn().mockResolvedValue(tokens);
    const { controller, reply } = tokenSetup({ refresh });
    await controller.token({ grant_type: 'refresh_token', refresh_token: 'old' }, reply);

    expect(refresh).toHaveBeenCalledWith('old');
    expect(reply.send).toHaveBeenCalledWith({ access_token: 'a', refresh_token: 'r', token_type: 'Bearer', expires_in: 900 });
  });

  it('answers 400 invalid_grant when the refresh token is bad', async () => {
    const { controller, reply } = tokenSetup({ refresh: jest.fn().mockRejectedValue(new Error('Invalid or expired refresh token')) });
    await controller.token({ grant_type: 'refresh_token', refresh_token: 'bad' }, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ error: 'invalid_grant', error_description: 'Invalid or expired refresh token' });
  });

  it('still rejects other grant types', async () => {
    const { controller, reply } = tokenSetup({});
    await controller.token({ grant_type: 'password' }, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ error: 'unsupported_grant_type' });
  });
});
