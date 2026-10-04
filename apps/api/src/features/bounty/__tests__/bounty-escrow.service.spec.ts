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
  const service = new BountyEscrowService(repository as never);
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
