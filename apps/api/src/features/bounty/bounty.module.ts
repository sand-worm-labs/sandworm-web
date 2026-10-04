import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BountyEntity } from '@sandworm/postgresql-typeorm';
import { BountyResolver } from './bounty.resolver';
import { BountyService } from './bounty.service';

@Module({
  imports: [TypeOrmModule.forFeature([BountyEntity])],
  providers: [BountyResolver, BountyService],
})
export class BountyModule {}
