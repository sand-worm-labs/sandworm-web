import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Plan } from '@sandworm/postgresql-typeorm';
import { WorkspaceService } from '../workspace.service';

// The SDK behind OpenRouterService is ESM-only and irrelevant to plan changes.
jest.mock('@/infrastructure/openrouter/openrouter.service', () => ({ OpenRouterService: class {} }));

const WORKSPACE_ID = '7daf9290-523a-41f6-93db-209f0e38a45a';
const OWNER_ID = '300c2f9c-300d-4d88-96cf-16fec0bdeec7';

function makeService(workspace: Record<string, unknown> | null) {
  const workspaceRepository = {
    findOne: jest.fn().mockResolvedValue(workspace),
    save: jest.fn(async (w) => w),
  };
  const service = new WorkspaceService(
    workspaceRepository as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
  );
  return { service, workspaceRepository };
}

describe('WorkspaceService.simulateWorkspaceUpgrade', () => {
  const originalEnv = process.env.NODE_ENV;
  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('sets the plan on a workspace the caller owns', async () => {
    process.env.NODE_ENV = 'development';
    const { service, workspaceRepository } = makeService({
      id: WORKSPACE_ID,
      ownerId: OWNER_ID,
      name: 'Team',
      plan: Plan.FREE,
    });

    const result = await service.simulateWorkspaceUpgrade(WORKSPACE_ID, OWNER_ID, Plan.PRO);

    expect(workspaceRepository.findOne).toHaveBeenCalledWith({
      where: { id: WORKSPACE_ID, ownerId: OWNER_ID },
    });
    expect(workspaceRepository.save).toHaveBeenCalledWith(expect.objectContaining({ plan: Plan.PRO }));
    expect(result.plan).toBe(Plan.PRO);
  });

  it('rejects a caller who does not own the workspace', async () => {
    process.env.NODE_ENV = 'development';
    const { service, workspaceRepository } = makeService(null);

    await expect(service.simulateWorkspaceUpgrade(WORKSPACE_ID, OWNER_ID, Plan.PRO)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(workspaceRepository.save).not.toHaveBeenCalled();
  });

  it('is disabled in production', async () => {
    process.env.NODE_ENV = 'production';
    const { service, workspaceRepository } = makeService({ id: WORKSPACE_ID, ownerId: OWNER_ID });

    await expect(service.simulateWorkspaceUpgrade(WORKSPACE_ID, OWNER_ID, Plan.PRO)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(workspaceRepository.findOne).not.toHaveBeenCalled();
    expect(workspaceRepository.save).not.toHaveBeenCalled();
  });
});

describe('WorkspaceService.startWorkspaceTrial', () => {
  it('moves a free workspace onto the trial, even in production', async () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const { service, workspaceRepository } = makeService({ id: WORKSPACE_ID, ownerId: OWNER_ID, plan: Plan.FREE });

    const result = await service.startWorkspaceTrial(WORKSPACE_ID, OWNER_ID);

    expect(workspaceRepository.save).toHaveBeenCalledWith(expect.objectContaining({ plan: Plan.TRIAL }));
    expect(result.plan).toBe(Plan.TRIAL);
    process.env.NODE_ENV = original;
  });

  it('refuses a workspace that is already on a plan', async () => {
    const { service, workspaceRepository } = makeService({ id: WORKSPACE_ID, ownerId: OWNER_ID, plan: Plan.PRO });

    await expect(service.startWorkspaceTrial(WORKSPACE_ID, OWNER_ID)).rejects.toBeInstanceOf(BadRequestException);
    expect(workspaceRepository.save).not.toHaveBeenCalled();
  });

  it('rejects a caller who does not own the workspace', async () => {
    const { service } = makeService(null);

    await expect(service.startWorkspaceTrial(WORKSPACE_ID, OWNER_ID)).rejects.toBeInstanceOf(NotFoundException);
  });
});
