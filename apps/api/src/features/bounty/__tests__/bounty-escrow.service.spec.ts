import { BadRequestException, NotFoundException } from '@nestjs/common';
import { bountyEscrowAbi, bountyRef, escrowAddressFor, escrowTokens } from '@sandworm/types/escrow';
import { encodeAbiParameters, encodeEventTopics } from 'viem';
import { BountyEscrowService } from '../bounty-escrow.service';

const CHAIN = 46630;
const ESCROW = escrowAddressFor(CHAIN)!;
const TOKEN = escrowTokens[CHAIN]![0]!.address;
const SPONSOR = '0x000000000000000000000000000000000000dEaD';
const TX = `0x${'ab'.repeat(32)}`;
const DEADLINE = 1_900_000_000n;

const fundingLog = (ref: string, token: string = TOKEN, address: string = ESCROW) => ({
  address,
  topics: encodeEventTopics({
    abi: bountyEscrowAbi,
    eventName: 'BountyCreated',
    args: { id: 7n, sponsor: SPONSOR, token: token as `0x${string}` },
  }),
  data: encodeAbiParameters(
    [{ type: 'uint256' }, { type: 'uint64' }, { type: 'uint16' }, { type: 'bytes32' }],
    [1_500_000_000n, DEADLINE, 500, ref as `0x${string}`],
  ),
});

const setup = (logs: unknown[], status = 'success', draft: Record<string, unknown> = {}) => {
  const entity: Record<string, unknown> = { slug: 'pyth-1a2b', creatorId: 'u1', status: 'draft', onchainId: null, ...draft };
  const repository = {
    findOneBy: jest.fn().mockResolvedValue(entity),
    save: jest.fn(async (value: unknown) => value),
  };
  const service = new BountyEscrowService(repository as never, { emit: jest.fn() } as never, {} as never);
  jest.spyOn(service as never, 'clientFor').mockReturnValue({
    getTransactionReceipt: async () => ({ status, logs }),
  } as never);
  return { service, entity, repository };
};

describe('BountyEscrowService.confirmFunding', () => {
  it('opens the bounty with the values read from the chain', async () => {
    const { service, repository } = setup([fundingLog(bountyRef('pyth-1a2b'))]);
    await service.confirmFunding('pyth-1a2b', CHAIN, TX, 'u1');

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'open',
        chainId: CHAIN,
        onchainId: '7',
        sponsorAddress: SPONSOR,
        fundTxHash: TX,
        rewardToken: 'USDG',
        rewardAmount: '1500',
        reward: '1,500 USDG',
        deadline: new Date(Number(DEADLINE) * 1000),
      }),
    );
  });

  it('rejects a funding made for a different bounty', async () => {
    const { service, repository } = setup([fundingLog(bountyRef('someone-elses'))]);
    await expect(service.confirmFunding('pyth-1a2b', CHAIN, TX, 'u1')).rejects.toThrow(BadRequestException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('ignores events from any contract but the escrow', async () => {
    const { service } = setup([fundingLog(bountyRef('pyth-1a2b'), TOKEN, '0x0000000000000000000000000000000000000001')]);
    await expect(service.confirmFunding('pyth-1a2b', CHAIN, TX, 'u1')).rejects.toThrow(BadRequestException);
  });

  it('rejects a token the app does not support', async () => {
    const { service } = setup([fundingLog(bountyRef('pyth-1a2b'), '0x0000000000000000000000000000000000000002')]);
    await expect(service.confirmFunding('pyth-1a2b', CHAIN, TX, 'u1')).rejects.toThrow('not supported');
  });

  it('rejects a failed transaction and a network with no escrow', async () => {
    await expect(setup([], 'reverted').service.confirmFunding('pyth-1a2b', CHAIN, TX, 'u1')).rejects.toThrow('failed');
    await expect(setup([]).service.confirmFunding('pyth-1a2b', 1, TX, 'u1')).rejects.toThrow('no escrow');
  });

  it('only lets the creator confirm', async () => {
    const { service } = setup([fundingLog(bountyRef('pyth-1a2b'))]);
    await expect(service.confirmFunding('pyth-1a2b', CHAIN, TX, 'someone-else')).rejects.toThrow(NotFoundException);
  });

  it('is safe to repeat with the same transaction', async () => {
    const { service, repository } = setup([], 'success', { onchainId: '7', fundTxHash: TX });
    await service.confirmFunding('pyth-1a2b', CHAIN, TX, 'u1');
    expect(repository.save).not.toHaveBeenCalled();
    await expect(service.confirmFunding('pyth-1a2b', CHAIN, `0x${'cd'.repeat(32)}`, 'u1')).rejects.toThrow('already funded');
  });
});

describe('BountyEscrowService.syncEscrow', () => {
  const ADA = '0x00000000000000000000000000000000000000A1';
  const BOB = '0x00000000000000000000000000000000000000B2';

  const award = (winner: string, amount: bigint) => ({ args: { id: 7n, winner, amount, fee: 0n } });

  const setupSync = (options: { awards?: unknown[]; closed?: boolean; entries?: unknown[]; bounty?: Record<string, unknown>; fails?: boolean } = {}) => {
    const entity: Record<string, unknown> = {
      slug: 'pyth-1a2b', status: 'open', chainId: CHAIN, onchainId: '7', fundTxHash: TX, winners: [], ...options.bounty,
    };
    const repository = {
      findOneBy: jest.fn().mockResolvedValue(entity),
      save: jest.fn(async (value: unknown) => value),
    };
    const entryRepository = { find: jest.fn().mockResolvedValue(options.entries ?? []) };
    const service = new BountyEscrowService(repository as never, { emit: jest.fn() } as never, entryRepository as never);
    const getContractEvents = jest.fn(async () => {
      if (options.fails) throw new Error('rpc down');
      return options.awards ?? [];
    });
    jest.spyOn(service as never, 'clientFor').mockReturnValue({
      getTransactionReceipt: async () => ({ blockNumber: 123n }),
      readContract: async () => ({ token: TOKEN, closed: options.closed ?? false }),
      getContractEvents,
    } as never);
    return { service, repository, getContractEvents };
  };

  const entry = (wallet: string, username: string, slug: string | null) => ({
    wallet,
    author: { username },
    document: { id: 'doc-id', slug, publishedAt: new Date() },
  });

  it('records the winners in order of what they were paid, and closes the bounty', async () => {
    const { service, repository, getContractEvents } = setupSync({
      closed: true,
      awards: [award(BOB, 300_000_000n), award(ADA, 700_000_000n)],
      entries: [entry(ADA.toLowerCase(), 'ada', 'adas-entry'), entry(BOB, 'bob', null)],
    });
    const bounty = await service.syncEscrow('pyth-1a2b');

    expect(getContractEvents).toHaveBeenCalledWith(expect.objectContaining({ eventName: 'Awarded', args: { id: 7n }, fromBlock: 123n }));
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'closed' }));
    expect(bounty.winners).toEqual([
      { place: '1st', author: 'ada', notebookSlug: 'adas-entry', amount: '700 USDG', address: ADA },
      { place: '2nd', author: 'bob', notebookSlug: 'doc-id', amount: '300 USDG', address: BOB },
    ]);
  });

  it('adds up a wallet that was awarded twice', async () => {
    const { service } = setupSync({ awards: [award(ADA, 100_000_000n), award(ADA, 50_000_000n)] });
    const bounty = await service.syncEscrow('pyth-1a2b');
    expect(bounty.winners).toHaveLength(1);
    expect(bounty.winners[0]).toMatchObject({ amount: '150 USDG' });
  });

  it('names a paid wallet that no entry claims by its address', async () => {
    const { service } = setupSync({ awards: [award(ADA, 100_000_000n)] });
    const bounty = await service.syncEscrow('pyth-1a2b');
    expect(bounty.winners[0]).toMatchObject({ author: '0x0000...00A1', notebookSlug: '' });
  });

  it('leaves an open bounty open and its winners alone when nothing was paid', async () => {
    const winners = [{ place: '1st', author: 'ada', notebookSlug: 'kept' }];
    const { service } = setupSync({ bounty: { winners } });
    const bounty = await service.syncEscrow('pyth-1a2b');
    expect(bounty.status).toBe('open');
    expect(bounty.winners).toEqual(winners);
  });

  it('does nothing for a bounty that is not in escrow', async () => {
    const { service, repository } = setupSync({ bounty: { chainId: null, onchainId: null } });
    await service.syncEscrow('pyth-1a2b');
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('says so when the chain cannot be read, and hides drafts', async () => {
    await expect(setupSync({ fails: true }).service.syncEscrow('pyth-1a2b')).rejects.toThrow('Could not read the escrow');
    await expect(setupSync({ bounty: { status: 'draft' } }).service.syncEscrow('pyth-1a2b')).rejects.toThrow(NotFoundException);
  });
});
