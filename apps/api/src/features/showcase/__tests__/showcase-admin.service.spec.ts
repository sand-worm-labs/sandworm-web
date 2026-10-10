jest.mock('../../workspace/service/workspace-membership.service', () => ({
  WorkspaceMembershipService: jest.fn(),
}));

import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ShowcaseAdminService } from '../showcase-admin.service';

const OFFICIAL = 'ws-official';

function makeService({
  officialIds = OFFICIAL,
  canEdit = true,
  password = '',
} = {}) {
  const countQuery: any = {};
  for (const method of ['where', 'andWhere'])
    countQuery[method] = jest.fn(() => countQuery);
  countQuery.getCount = jest.fn().mockResolvedValue(0);

  const documentRepository = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    save: jest.fn(async (doc: unknown) => doc),
    createQueryBuilder: jest.fn(() => countQuery),
  } as any;
  const leadRepository = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
  } as any;
  const groupRepository = {
    findOne: jest.fn().mockResolvedValue({ id: 'money' }),
  } as any;
  const categoryRepository = {
    findOne: jest.fn().mockResolvedValue(null),
    count: jest.fn().mockResolvedValue(9),
    create: jest.fn((row: unknown) => row),
    save: jest.fn(),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  } as any;
  const chainRepository = {
    create: jest.fn((row: unknown) => row),
    save: jest.fn(),
  } as any;
  const membership = {
    assertCanEdit: jest.fn(async () => {
      if (!canEdit) throw new ForbiddenException('view-only');
    }),
  } as any;
  const config = {
    get: jest.fn((key: string) =>
      key === 'SHOWCASE_STUDIO_PASSWORD' ? password : officialIds,
    ),
  } as any;

  const service = new ShowcaseAdminService(
    documentRepository,
    leadRepository,
    groupRepository,
    categoryRepository,
    chainRepository,
    membership,
    config,
  );
  return {
    service,
    documentRepository,
    leadRepository,
    groupRepository,
    categoryRepository,
    chainRepository,
    membership,
    countQuery,
  };
}

describe('staff only', () => {
  it('lets someone who can edit an official workspace in', async () => {
    const { service, membership } = makeService();

    await expect(
      service.assertStaff({ userId: 'u1' }),
    ).resolves.toBeUndefined();
    expect(membership.assertCanEdit).toHaveBeenCalledWith(OFFICIAL, 'u1');
  });

  it('turns away everyone else, and everyone when no workspace is official', async () => {
    await expect(
      makeService({ canEdit: false }).service.assertStaff({ userId: 'u1' }),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      makeService({ officialIds: '' }).service.assertStaff({ userId: 'u1' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('checks every official workspace before refusing', async () => {
    const { service, membership } = makeService({ officialIds: 'a, b' });
    membership.assertCanEdit
      .mockRejectedValueOnce(new Error('not in a'))
      .mockResolvedValueOnce(undefined);

    await expect(
      service.assertStaff({ userId: 'u1' }),
    ).resolves.toBeUndefined();
    expect(membership.assertCanEdit).toHaveBeenCalledTimes(2);
  });

  it('guards every studio action', async () => {
    const { service } = makeService({ canEdit: false });
    const actions = [
      service.getOverview({ userId: 'u' }),
      service.saveCategory({ userId: 'u' }, {}),
      service.deleteCategory({ userId: 'u' }, 'x'),
      service.saveChain({ userId: 'u' }, {}),
      service.approveClaim({ userId: 'u' }, 'lead'),
    ];
    for (const action of actions)
      await expect(action).rejects.toThrow(ForbiddenException);
  });
});

describe('overview', () => {
  it('lists official-workspace notebooks, drafts included, and the newest leads', async () => {
    const { service, documentRepository, leadRepository } = makeService();
    documentRepository.find.mockResolvedValue([
      {
        id: 'd1',
        workspaceId: OFFICIAL,
        title: 'Paj',
        slug: 'paj',
        description: null,
        visibility: 'PUBLIC',
        publishedAt: null,
        updatedAt: new Date(),
        showcase: { status: 'draft' },
      },
    ]);
    leadRepository.find.mockResolvedValue([
      { id: 'l1', kind: 'claim', protocol: 'Paj', createdAt: new Date() },
    ]);

    const overview = await service.getOverview({ userId: 'u1' });

    expect(documentRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({ order: { updatedAt: 'DESC' } }),
    );
    expect(overview.notebooks).toEqual([
      expect.objectContaining({ id: 'd1', showcase: { status: 'draft' } }),
    ]);
    expect(overview.leads).toEqual([
      expect.objectContaining({ id: 'l1', kind: 'claim' }),
    ]);
    expect(overview.officialWorkspaceIds).toEqual([OFFICIAL]);
  });
});

describe('categories', () => {
  const valid = {
    slug: 'off-ramps',
    name: 'Off-ramps',
    groupId: 'money',
    question: 'How does money leave crypto?',
    protocols: ['Paj'],
    chains: ['solana'],
  };

  it('saves a category, putting a new one after the others', async () => {
    const { service, categoryRepository } = makeService();

    await service.saveCategory({ userId: 'u1' }, valid);

    expect(categoryRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'off-ramps',
        groupId: 'money',
        metricSpec: null,
        position: 10,
      }),
    );
  });

  it("keeps an existing category's place when it is edited", async () => {
    const { service, categoryRepository } = makeService();
    categoryRepository.findOne.mockResolvedValue({
      slug: 'off-ramps',
      position: 3,
    });

    await service.saveCategory({ userId: 'u1' }, valid);

    expect(categoryRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ position: 3 }),
    );
  });

  it('refuses a bad slug, an empty question and an unknown group, saying why', async () => {
    const { service, groupRepository, categoryRepository } = makeService();

    await expect(
      service.saveCategory({ userId: 'u1' }, { ...valid, slug: 'Off Ramps' }),
    ).rejects.toThrow(/slug/);
    await expect(
      service.saveCategory({ userId: 'u1' }, { ...valid, question: '  ' }),
    ).rejects.toThrow(/question/);
    groupRepository.findOne.mockResolvedValue(null);
    await expect(service.saveCategory({ userId: 'u1' }, valid)).rejects.toThrow(
      /no group called "money"/,
    );
    expect(categoryRepository.save).not.toHaveBeenCalled();
  });

  it('deletes an empty category, and refuses one with notebooks filed under it', async () => {
    const { service, categoryRepository, countQuery } = makeService();

    await expect(
      service.deleteCategory({ userId: 'u1' }, 'off-ramps'),
    ).resolves.toBe(true);
    expect(categoryRepository.delete).toHaveBeenCalledWith({
      slug: 'off-ramps',
    });

    countQuery.getCount.mockResolvedValue(2);
    await expect(
      service.deleteCategory({ userId: 'u1' }, 'stablecoins'),
    ).rejects.toThrow(/2 notebooks are filed under "stablecoins"/);
    expect(categoryRepository.delete).toHaveBeenCalledTimes(1);
  });
});

describe('chains', () => {
  it("saves a chain's color and place, and refuses a color that is not a hex code", async () => {
    const { service, chainRepository } = makeService();

    await service.saveChain(
      { userId: 'u1' },
      { name: 'solana', color: '#9945FF', position: 1 },
    );
    expect(chainRepository.save).toHaveBeenCalledWith({
      name: 'solana',
      color: '#9945FF',
      position: 1,
    });

    await expect(
      service.saveChain({ userId: 'u1' }, { name: 'solana', color: 'purple' }),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('approving a claim', () => {
  const caseStudy = {
    slug: 'paj',
    showcase: {
      kind: 'case_study',
      category: 'off-ramps',
      protocol: 'Paj',
      status: 'published',
      claimed: false,
    },
  };

  it('marks the case study the claim names as claimed', async () => {
    const { service, leadRepository, documentRepository } = makeService();
    leadRepository.findOne.mockResolvedValue({
      id: 'l1',
      kind: 'claim',
      notebookSlug: 'paj',
    });
    documentRepository.findOne.mockResolvedValue({ ...caseStudy });

    await expect(service.approveClaim({ userId: 'u1' }, 'l1')).resolves.toBe(
      true,
    );

    expect(documentRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        showcase: expect.objectContaining({ claimed: true, protocol: 'Paj' }),
      }),
    );
  });

  it('refuses a lead that is not a claim, or names no notebook, and says when there is none', async () => {
    const { service, leadRepository, documentRepository } = makeService();

    leadRepository.findOne.mockResolvedValue(null);
    await expect(service.approveClaim({ userId: 'u1' }, 'x')).rejects.toThrow(
      NotFoundException,
    );

    leadRepository.findOne.mockResolvedValue({
      id: 'l2',
      kind: 'coverage',
      notebookSlug: null,
    });
    await expect(service.approveClaim({ userId: 'u1' }, 'l2')).rejects.toThrow(
      /Only a claim/,
    );

    leadRepository.findOne.mockResolvedValue({
      id: 'l3',
      kind: 'claim',
      notebookSlug: 'gone',
    });
    documentRepository.findOne.mockResolvedValue(null);
    await expect(service.approveClaim({ userId: 'u1' }, 'l3')).rejects.toThrow(
      /No Showcase notebook with the slug "gone"/,
    );
    expect(documentRepository.save).not.toHaveBeenCalled();
  });
});

describe('the studio password', () => {
  it('lets in whoever knows it, without an account', async () => {
    const { service, membership } = makeService({
      canEdit: false,
      password: 'open-sesame',
    });

    await expect(
      service.assertStaff({ password: 'open-sesame' }),
    ).resolves.toBeUndefined();
    expect(membership.assertCanEdit).not.toHaveBeenCalled();
  });

  it('turns away a wrong password, an empty one, and any password when none is set', async () => {
    const set = makeService({
      canEdit: false,
      password: 'open-sesame',
    }).service;
    await expect(set.assertStaff({ password: 'open-sesamE' })).rejects.toThrow(
      ForbiddenException,
    );
    await expect(set.assertStaff({ password: '' })).rejects.toThrow(
      ForbiddenException,
    );
    await expect(set.assertStaff({})).rejects.toThrow(ForbiddenException);

    const unset = makeService({ canEdit: false }).service;
    await expect(unset.assertStaff({ password: '' })).rejects.toThrow(
      ForbiddenException,
    );
    await expect(unset.assertStaff({ password: 'anything' })).rejects.toThrow(
      ForbiddenException,
    );
  });
});

describe('filing a notebook', () => {
  const showcase = {
    kind: 'case_study',
    category: 'off-ramps',
    protocol: 'Paj',
    status: 'published',
  };

  it("sets a notebook's Showcase metadata, or takes it off with null", async () => {
    const { service, documentRepository } = makeService();
    documentRepository.findOne.mockResolvedValue({ id: 'd1', showcase: null });

    await service.saveNotebook({ userId: 'u1' }, 'd1', showcase);
    expect(documentRepository.save).toHaveBeenLastCalledWith(
      expect.objectContaining({
        showcase: expect.objectContaining({
          category: 'off-ramps',
          status: 'published',
        }),
      }),
    );

    await service.saveNotebook({ userId: 'u1' }, 'd1', null);
    expect(documentRepository.save).toHaveBeenLastCalledWith(
      expect.objectContaining({ showcase: null }),
    );
  });

  it('refuses bad metadata, a notebook outside the official workspaces, and the unauthorised', async () => {
    const { service, documentRepository } = makeService();
    documentRepository.findOne.mockResolvedValue({ id: 'd1' });
    await expect(
      service.saveNotebook({ userId: 'u1' }, 'd1', { kind: 'nonsense' }),
    ).rejects.toThrow(BadRequestException);

    documentRepository.findOne.mockResolvedValue(null);
    await expect(
      service.saveNotebook({ userId: 'u1' }, 'elsewhere', showcase),
    ).rejects.toThrow(NotFoundException);

    await expect(
      makeService({ canEdit: false }).service.saveNotebook(
        { userId: 'u1' },
        'd1',
        showcase,
      ),
    ).rejects.toThrow(ForbiddenException);
  });
});
