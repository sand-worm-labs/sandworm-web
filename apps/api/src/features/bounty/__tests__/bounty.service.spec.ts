import { BadRequestException } from '@nestjs/common';
import { BountyService, prizeSchedule } from '../bounty.service';

const entity = (overrides: Record<string, unknown> = {}) => ({
  slug: 'pyth-1a2b',
  title: 'A bounty',
  sponsor: 'Sponsor',
  type: 'analysis',
  reward: '10 PYTH',
  status: 'open',
  deadline: null,
  creatorId: 'creator',
  prizes: [],
  winners: [],
  sample: false,
  featured: false,
  position: 0,
  ...overrides,
});

const setup = (found: Record<string, unknown> | null) => {
  const repository = { findOneBy: jest.fn().mockResolvedValue(found) };
  return new BountyService(repository as never, {} as never);
};

describe('BountyService.getBounty', () => {
  it('marks the bounty as the viewer\'s own when they created it', async () => {
    const bounty = await setup(entity()).getBounty('pyth-1a2b', 'creator');
    expect(bounty?.isMine).toBe(true);
  });

  it('is not the viewer\'s own for anyone else, or for someone signed out', async () => {
    expect((await setup(entity()).getBounty('pyth-1a2b', 'someone-else'))?.isMine).toBe(false);
    expect((await setup(entity()).getBounty('pyth-1a2b', undefined))?.isMine).toBe(false);
  });

  it('never matches a signed-out viewer to a bounty with no creator', async () => {
    const bounty = await setup(entity({ creatorId: undefined })).getBounty('pyth-1a2b', undefined);
    expect(bounty?.isMine).toBe(false);
  });

  it('still hides a draft from everyone but its creator', async () => {
    expect(await setup(entity({ status: 'draft' })).getBounty('pyth-1a2b', 'someone-else')).toBeNull();
    expect((await setup(entity({ status: 'draft' })).getBounty('pyth-1a2b', 'creator'))?.isMine).toBe(true);
  });
});

describe('prizeSchedule', () => {
  it('numbers the places in order and adds them up', () => {
    expect(prizeSchedule(['6000', '3000', '1000'], 'USDT')).toEqual({
      tiers: [
        { place: 1, amount: '6000' },
        { place: 2, amount: '3000' },
        { place: 3, amount: '1000' },
      ],
      total: '10000',
    });
  });

  it('keeps decimals, and lets places pay the same', () => {
    const { tiers, total } = prizeSchedule(['500.5', '500.5'], 'USDT');
    expect(tiers.map(tier => tier.amount)).toEqual(['500.5', '500.5']);
    expect(total).toBe('1001');
  });

  it('refuses a place that pays more than the one above it', () => {
    expect(() => prizeSchedule(['1000', '2000'], 'USDT')).toThrow(BadRequestException);
  });

  it('refuses a prize of nothing', () => {
    expect(() => prizeSchedule(['1000', '0'], 'USDT')).toThrow(BadRequestException);
  });
});
