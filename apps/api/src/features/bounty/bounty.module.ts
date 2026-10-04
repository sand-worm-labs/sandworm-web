import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BountyEntity } from '@sandworm/postgresql-typeorm';
import { BountyResolver } from './bounty.resolver';
import { BountyService } from './bounty.service';
import { BountyEscrowService } from './bounty-escrow.service';
import { WorkspaceModule } from '../workspace/workspace.module';

@Module({
  imports: [TypeOrmModule.forFeature([BountyEntity]), WorkspaceModule],
  providers: [BountyResolver, BountyService, BountyEscrowService],
})
export class BountyModule {}
