import { EnvironmentResolver } from '../environment.resolver';
import { EnvironmentStatus, UserWorkspaceRole } from '@sandworm/postgresql-typeorm';

function makeResolver() {
  const environmentService = {
    getEnvironment: jest.fn(),
    getEnvironmentStatus: jest.fn(),
    getEnvironmentVariables: jest.fn(),
    restartEnvironment: jest.fn(),
    setEnvironmentVariables: jest.fn(),
    deleteEnvironmentVariable: jest.fn(),
  } as any;
  const sysinfoService = {
    collect: jest.fn(),
  } as any;

  const resolver = new EnvironmentResolver(environmentService, sysinfoService);
  return { resolver, environmentService, sysinfoService };
}

const WORKSPACE_ID = 'ws-1';

describe('EnvironmentResolver', () => {
  it('getEnvironment delegates to service', async () => {
    const { resolver, environmentService } = makeResolver();
    const env = { id: 'env-1' } as any;
    environmentService.getEnvironment.mockResolvedValue(env);

    const result = await resolver.getEnvironment(WORKSPACE_ID);

    expect(environmentService.getEnvironment).toHaveBeenCalledWith(WORKSPACE_ID);
    expect(result).toBe(env);
  });

  it('getEnvironmentStatus delegates to service', async () => {
    const { resolver, environmentService } = makeResolver();
    environmentService.getEnvironmentStatus.mockResolvedValue(EnvironmentStatus.RUNNING);

    const result = await resolver.getEnvironmentStatus(WORKSPACE_ID);

    expect(environmentService.getEnvironmentStatus).toHaveBeenCalledWith(WORKSPACE_ID);
    expect(result).toBe(EnvironmentStatus.RUNNING);
  });

  it('getEnvironmentVariables shows values in full to editors', async () => {
    const { resolver, environmentService } = makeResolver();
    environmentService.getEnvironmentVariables.mockResolvedValue([{ name: 'KEY', value: 'sk-1234567890' }]);

    const result = await resolver.getEnvironmentVariables(WORKSPACE_ID, {
      req: { workspaceRoles: { [WORKSPACE_ID]: UserWorkspaceRole.EDITOR } },
    });

    expect(environmentService.getEnvironmentVariables).toHaveBeenCalledWith(WORKSPACE_ID);
    expect(result).toEqual([{ name: 'KEY', value: 'sk-1234567890' }]);
  });

  it('getEnvironmentVariables masks values for viewers and unknown roles', async () => {
    const { resolver, environmentService } = makeResolver();
    environmentService.getEnvironmentVariables.mockImplementation(async () => [{ name: 'KEY', value: 'sk-1234567890' }]);

    const viewer = await resolver.getEnvironmentVariables(WORKSPACE_ID, {
      req: { workspaceRoles: { [WORKSPACE_ID]: UserWorkspaceRole.VIEWER } },
    });
    const unknown = await resolver.getEnvironmentVariables(WORKSPACE_ID, {});

    expect(viewer[0].value).toBe('••••••••7890');
    expect(unknown[0].value).toBe('••••••••7890');
  });

  it('currentSysInfo delegates to sysinfoService.collect', async () => {
    const { resolver, sysinfoService } = makeResolver();
    sysinfoService.collect.mockResolvedValue({ python: {} });

    const result = await resolver.currentSysInfo(WORKSPACE_ID, 'session-1');

    expect(sysinfoService.collect).toHaveBeenCalledWith({ workspaceId: WORKSPACE_ID, sessionId: 'session-1' });
    expect(result).toEqual({ python: {} });
  });

  it('restartEnvironment delegates to service', async () => {
    const { resolver, environmentService } = makeResolver();
    const env = { id: 'env-1' } as any;
    environmentService.restartEnvironment.mockResolvedValue(env);

    const result = await resolver.restartEnvironment({ workspaceId: WORKSPACE_ID });

    expect(environmentService.restartEnvironment).toHaveBeenCalledWith(WORKSPACE_ID);
    expect(result).toBe(env);
  });

  it('setEnvironmentVariables delegates to service', async () => {
    const { resolver, environmentService } = makeResolver();
    const input = { add: [], remove: [] } as any;
    environmentService.setEnvironmentVariables.mockResolvedValue([]);

    const result = await resolver.setEnvironmentVariables(WORKSPACE_ID, input);

    expect(environmentService.setEnvironmentVariables).toHaveBeenCalledWith(WORKSPACE_ID, input);
    expect(result).toEqual([]);
  });

  it('deleteEnvironmentVariable delegates to service', async () => {
    const { resolver, environmentService } = makeResolver();
    environmentService.deleteEnvironmentVariable.mockResolvedValue(true);

    const result = await resolver.deleteEnvironmentVariable(WORKSPACE_ID, 'var-1');

    expect(environmentService.deleteEnvironmentVariable).toHaveBeenCalledWith(WORKSPACE_ID, 'var-1');
    expect(result).toBe(true);
  });
});
