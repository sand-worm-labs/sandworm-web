import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BountyEntity, BountyEntryEntity, DocumentEntity } from '@sandworm/postgresql-typeorm';
import { BountyResolver } from './bounty.resolver';
import { BountyService } from './bounty.service';
import { BountyEntryService } from './bounty-entry.service';
import { BountyEscrowService } from './bounty-escrow.service';
import { WorkspaceModule } from '../workspace/workspace.module';

@Module({
  imports: [TypeOrmModule.forFeature([BountyEntity, BountyEntryEntity, DocumentEntity]), WorkspaceModule],
  providers: [BountyResolver, BountyService, BountyEntryService, BountyEscrowService],
})
export class BountyModule {}
