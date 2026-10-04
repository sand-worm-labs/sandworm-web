import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BountyEntity } from '@sandworm/postgresql-typeorm';
import { randomBytes } from 'crypto';
import { Not, Repository } from 'typeorm';
import { WorkspaceMembershipService } from '../workspace/service/workspace-membership.service';
import { Bounty } from './bounty.model';
import { CreateBountyInput } from './dto/bounty.dto';

const slugify = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

const formatAmount = (amount: string) =>
  Number(amount).toLocaleString('en-US', { maximumFractionDigits: 6 });

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
    return Bounty.fromEntity(entity);
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
      judging: [],
      dataHints: [],
      winners: [],
      reward: `${formatAmount(input.rewardAmount)} ${input.rewardToken}`,
      rewardToken: input.rewardToken,
      rewardAmount: input.rewardAmount,
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
