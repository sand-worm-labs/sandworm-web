import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BountyEntity, type BountyPrizeTier } from '@sandworm/postgresql-typeorm';
import { escrowTokens } from '@sandworm/types/escrow';
import { randomBytes } from 'crypto';
import { Not, Repository } from 'typeorm';
import { formatUnits, parseUnits } from 'viem';
import { WorkspaceMembershipService } from '../workspace/service/workspace-membership.service';
import { formatAmount } from './bounty.format';
import { Bounty } from './bounty.model';
import { CreateBountyInput } from './dto/bounty.dto';

// Every supported reward token has its own decimals, the same on each network.
const decimalsOf = (symbol: string) =>
  Object.values(escrowTokens).flat().find(token => token.symbol === symbol)?.decimals ?? 6;

// The prize schedule a bounty is made with: one prize per place, best first. A lower place never
// pays more than the one above it, so the order says which is which.
export const prizeSchedule = (prizes: string[], symbol: string) => {
  const decimals = decimalsOf(symbol);
  const units = prizes.map(prize => parseUnits(prize, decimals));
  units.forEach((unit, index) => {
    if (unit <= 0n) throw new BadRequestException('Every prize must be more than zero');
    if (index > 0 && unit > units[index - 1]) {
      throw new BadRequestException('A place cannot pay more than the place above it');
    }
  });
  const tiers: BountyPrizeTier[] = units.map((unit, index) => ({ place: index + 1, amount: formatUnits(unit, decimals) }));
  const total = formatUnits(units.reduce((sum, unit) => sum + unit, 0n), decimals);
  return { tiers, total };
};

const slugify = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

@Injectable()
export class BountyService {
  constructor(
    @InjectRepository(BountyEntity)
    private readonly bountyRepository: Repository<BountyEntity>,
    private readonly workspaceMembershipService: WorkspaceMembershipService,
  ) { }

  async getBounties(featured?: boolean): Promise<Bounty[]> {
    const entities = await this.bountyRepository.find({
      where: { status: Not('draft'), ...(featured ? { featured: true } : {}) },
      order: { sample: 'ASC', position: 'ASC', createdAt: 'DESC' },
    });
    return Bounty.fromEntities(entities);
  }

  async getBounty(slug: string, userId?: string): Promise<Bounty | null> {
    const entity = await this.bountyRepository.findOneBy({ slug });
    if (!entity) return null;
    if (entity.status === 'draft' && entity.creatorId !== userId) return null;
    const bounty = Bounty.fromEntity(entity);
    bounty.isMine = !!userId && entity.creatorId === userId;
    return bounty;
  }

  async getBountyDrafts(workspaceId: string, userId: string): Promise<Bounty[]> {
    await this.workspaceMembershipService.assertActiveMember(workspaceId, userId);
    const entities = await this.bountyRepository.find({
      where: { workspaceId, creatorId: userId, status: 'draft' },
      order: { createdAt: 'DESC' },
    });
    return Bounty.fromEntities(entities);
  }

  async createBounty(input: CreateBountyInput, userId: string): Promise<Bounty> {
    await this.workspaceMembershipService.assertCanEdit(input.workspaceId, userId);
    if (input.deadline.getTime() <= Date.now()) {
      throw new BadRequestException('The deadline must be in the future');
    }

    const { tiers, total } = prizeSchedule(input.prizes, input.rewardToken);

    const entity = this.bountyRepository.create({
      slug: `${slugify(input.title) || 'bounty'}-${randomBytes(3).toString('hex')}`,
      title: input.title.trim(),
      sponsor: input.sponsor.trim(),
      type: input.type,
      status: 'draft',
      summary: input.summary.trim(),
      background: input.background?.trim() || null,
      details: input.details.trim(),
      requirements: (input.requirements ?? []).map(line => line.trim()).filter(Boolean),
      deliverables: (input.deliverables ?? []).map(line => line.trim()).filter(Boolean),
      prizes: [],
      prizeTiers: tiers,
      judging: [],
      dataHints: [],
      winners: [],
      // What the winners are paid in all. The escrow is funded with a little more: the fee.
      reward: `${formatAmount(total)} ${input.rewardToken}`,
      rewardToken: input.rewardToken,
      rewardAmount: total,
      deadline: input.deadline,
      creatorId: userId,
      workspaceId: input.workspaceId,
      sample: false,
      featured: false,
      position: 0,
    });
    return Bounty.fromEntity(await this.bountyRepository.save(entity));
  }
}
