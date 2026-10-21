import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BountyEntryService } from '../bounty-entry.service';

const WORKSPACE_ID = 'w1';
const WALLET = '0x000000000000000000000000000000000000dEaD';
const FUTURE = new Date(Date.now() + 86_400_000);
const PAST = new Date(Date.now() - 86_400_000);

const setup = (options: {
  bounty?: Record<string, unknown> | null;
  document?: Record<string, unknown> | null;
  existing?: Record<string, unknown> | null;
  entries?: Record<string, unknown>[];
  // What the trust check does: resolves with an attestation, or rejects with a reason.
  trusted?: () => Promise<unknown>;
} = {}) => {
  const bounty = options.bounty === null ? null : { slug: 'pyth-1a2b', status: 'open', deadline: FUTURE, creatorId: 'sponsor', onchainId: '7', ...options.bounty };
  const document = options.document === null ? null : { id: 'd1', authorId: 'u1', deletedAt: null, publishedAt: new Date(), visibility: 'PUBLIC', slug: 'my-entry', title: 'My entry', workspaceId: WORKSPACE_ID, ...options.document };
  const author = { username: 'ada', fullName: 'Ada L', email: 'ada@example.com' };
  const entryRepository = {
    find: jest.fn().mockResolvedValue(options.entries ?? []),
    findOneBy: jest.fn().mockResolvedValue(options.existing ?? null),
    findOneOrFail: jest.fn(async () => ({ ...entryRepository.save.mock.calls.at(-1)?.[0], id: 'e1', author, document })),
    create: jest.fn((value: unknown) => ({ ...(value as object) })),
    save: jest.fn(async (value: unknown) => ({ ...(value as object), id: 'e1' })),
  };
  const trust = { trusted: jest.fn(options.trusted ?? (async () => ({ id: 'a1' }))) };
  const service = new BountyEntryService(
    entryRepository as never,
    { findOneBy: jest.fn().mockResolvedValue(bounty) } as never,
    { findOneBy: jest.fn().mockResolvedValue(document) } as never,
    trust as never,
  );
  return { service, entryRepository, author, document, trust };
};

describe('BountyEntryService.submitEntry: trust', () => {
  it('records which attestation made the notebook trusted', async () => {
    const { service, entryRepository, trust } = setup();
    await service.submitEntry('pyth-1a2b', 'd1', WALLET, 'u1');

    expect(trust.trusted).toHaveBeenCalledWith({ userId: 'u1', workspaceId: WORKSPACE_ID, documentId: 'd1' });
    expect(entryRepository.save).toHaveBeenCalledWith(expect.objectContaining({ attestationId: 'a1' }));
  });

  it('refuses a notebook that is not trusted, and saves nothing', async () => {
    const { service, entryRepository } = setup({
      trusted: async () => {
        throw new BadRequestException('This notebook is not trusted yet');
      },
    });

    await expect(service.submitEntry('pyth-1a2b', 'd1', WALLET, 'u1')).rejects.toThrow('not trusted');
    expect(entryRepository.save).not.toHaveBeenCalled();
  });

  it('does not ask for trust when trust is switched off', async () => {
    process.env.BOUNTY_REQUIRE_TRUST = 'false';
    try {
      const { service, trust, entryRepository } = setup();
      await service.submitEntry('pyth-1a2b', 'd1', WALLET, 'u1');
      expect(trust.trusted).not.toHaveBeenCalled();
      expect(entryRepository.save).toHaveBeenCalledWith(expect.objectContaining({ attestationId: null }));
    } finally {
      delete process.env.BOUNTY_REQUIRE_TRUST;
    }
  });
});

describe('BountyEntryService.submitEntry', () => {
  it('records a published notebook with the checksummed wallet', async () => {
    const { service, entryRepository } = setup();
    const entry = await service.submitEntry('pyth-1a2b', 'd1', WALLET.toLowerCase(), 'u1');

    expect(entryRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ bountySlug: 'pyth-1a2b', authorId: 'u1', documentId: 'd1', wallet: WALLET, submittedAt: expect.any(Date) }),
    );
    expect(entry).toMatchObject({ author: 'ada', notebookSlug: 'my-entry', wallet: WALLET, isMine: true });
  });

  it('refuses a notebook that is not published', async () => {
    const { service } = setup({ document: { publishedAt: null } });
    await expect(service.submitEntry('pyth-1a2b', 'd1', WALLET, 'u1')).rejects.toThrow(BadRequestException);
  });

  it('refuses an unlisted notebook: its secret link would be printed on a public page', async () => {
    const { service, entryRepository } = setup({ document: { visibility: 'UNLISTED' } });
    await expect(service.submitEntry('pyth-1a2b', 'd1', WALLET, 'u1')).rejects.toThrow(/publicly/);
    expect(entryRepository.save).not.toHaveBeenCalled();
  });

  it.each(['WORKSPACE', 'LINK'])('refuses a %s notebook too', async visibility => {
    const { service } = setup({ document: { visibility } });
    await expect(service.submitEntry('pyth-1a2b', 'd1', WALLET, 'u1')).rejects.toThrow(BadRequestException);
  });

  it("refuses someone else's notebook", async () => {
    const { service } = setup({ document: { authorId: 'someone-else' } });
    await expect(service.submitEntry('pyth-1a2b', 'd1', WALLET, 'u1')).rejects.toThrow(NotFoundException);
  });

  it('refuses an entry after the deadline', async () => {
    const { service } = setup({ bounty: { deadline: PAST } });
    await expect(service.submitEntry('pyth-1a2b', 'd1', WALLET, 'u1')).rejects.toThrow('no longer taking entries');
  });

  it('refuses an entry to a draft bounty', async () => {
    const { service } = setup({ bounty: { status: 'draft' } });
    await expect(service.submitEntry('pyth-1a2b', 'd1', WALLET, 'u1')).rejects.toThrow(NotFoundException);
  });

  it('needs a wallet when the bounty is funded in escrow', async () => {
    const { service } = setup();
    await expect(service.submitEntry('pyth-1a2b', 'd1', undefined, 'u1')).rejects.toThrow('wallet');
  });

  it('refuses a wallet that is not an address', async () => {
    const { service } = setup();
    await expect(service.submitEntry('pyth-1a2b', 'd1', '0x123', 'u1')).rejects.toThrow('not valid');
  });

  it('takes an entry without a wallet when nothing is in escrow', async () => {
    const { service, entryRepository } = setup({ bounty: { onchainId: null } });
    await service.submitEntry('pyth-1a2b', 'd1', undefined, 'u1');
    expect(entryRepository.save).toHaveBeenCalledWith(expect.objectContaining({ wallet: null }));
  });

  it('keeps the first submission time when submitted again', async () => {
    const first = new Date('2026-10-01T00:00:00Z');
    const { service, entryRepository } = setup({ existing: { bountySlug: 'pyth-1a2b', authorId: 'u1', submittedAt: first } });
    await service.submitEntry('pyth-1a2b', 'd1', WALLET, 'u1');
    expect(entryRepository.save).toHaveBeenCalledWith(expect.objectContaining({ submittedAt: first }));
  });
});

describe('BountyEntryService.startEntry', () => {
  it('records the notebook as not yet submitted', async () => {
    const { service, entryRepository } = setup({ document: { publishedAt: null } });
    await service.startEntry('pyth-1a2b', 'd1', 'u1');
    expect(entryRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ bountySlug: 'pyth-1a2b', authorId: 'u1', documentId: 'd1', submittedAt: null }),
    );
  });

  it('does not replace an entry that was already submitted', async () => {
    const { service } = setup({ existing: { submittedAt: new Date() } });
    await expect(service.startEntry('pyth-1a2b', 'd2', 'u1')).rejects.toThrow('already submitted');
  });
});

describe('BountyEntryService.getEntries', () => {
  const entries = (author: Record<string, unknown>, document: Record<string, unknown>) => [
    { id: 'e1', bountySlug: 'pyth-1a2b', documentId: 'd1', authorId: 'u1', wallet: WALLET, submittedAt: new Date(), author, document },
    { id: 'e2', bountySlug: 'pyth-1a2b', documentId: 'd2', authorId: 'u2', wallet: WALLET, submittedAt: new Date(), author, document: { ...document, publishedAt: null } },
  ];

  it('does not list an entry whose notebook was made unlisted after it was submitted', async () => {
    const { author, document } = setup();
    const { service } = setup({ entries: [
      { id: 'e1', bountySlug: 'pyth-1a2b', documentId: 'd1', authorId: 'u1', wallet: WALLET, submittedAt: new Date(), author, document: { ...document, visibility: 'UNLISTED' } },
    ] });
    expect(await service.getEntries('pyth-1a2b', 'a-reader')).toHaveLength(0);
  });

  it('lists published entries and hides wallets from other readers', async () => {
    const { author, document } = setup();
    const { service } = setup({ entries: entries(author, document!) });

    const seen = await service.getEntries('pyth-1a2b', 'a-reader');
    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatchObject({ author: 'ada', wallet: null, isMine: false });
  });

  it("gives the bounty's creator the wallets", async () => {
    const { author, document } = setup();
    const { service } = setup({ entries: entries(author, document!) });
    const seen = await service.getEntries('pyth-1a2b', 'sponsor');
    expect(seen[0]!.wallet).toBe(WALLET);
  });

  it('never shows an email address as the author', async () => {
    const { document } = setup();
    const { service } = setup({ entries: entries({ email: 'ada@example.com' }, document!) });
    const seen = await service.getEntries('pyth-1a2b');
    expect(seen[0]!.author).toBe('Anonymous');
  });

  it("returns nothing for someone else's draft", async () => {
    const { author, document } = setup();
    const { service } = setup({ bounty: { status: 'draft' }, entries: entries(author, document!) });
    expect(await service.getEntries('pyth-1a2b', 'a-reader')).toEqual([]);
  });
});
