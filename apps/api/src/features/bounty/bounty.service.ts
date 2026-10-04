import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BountyEntity } from '@sandworm/postgresql-typeorm';
import { Repository } from 'typeorm';
import { Bounty } from './bounty.model';

@Injectable()
export class BountyService {
  constructor(
    @InjectRepository(BountyEntity)
    private readonly bountyRepository: Repository<BountyEntity>,
  ) { }

  async getBounties(featured?: boolean): Promise<Bounty[]> {
    const entities = await this.bountyRepository.find({
      where: featured ? { featured: true } : {},
      order: { position: 'ASC', createdAt: 'ASC' },
    });
    return Bounty.fromEntities(entities);
  }
}
