import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotebookAttestationEntity } from '@sandworm/postgresql-typeorm';
import { DocumentModule } from '../document/document.module';
import { NotebookBlocksModule } from '../notebook-blocks/notebook-blocks.module';
import { TRUST_GATE } from './trust.gate';
import { TrustResolver } from './trust.resolver';
import { TrustService } from './trust.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotebookAttestationEntity]), NotebookBlocksModule, DocumentModule],
  providers: [TrustResolver, TrustService, { provide: TRUST_GATE, useExisting: TrustService }],
  exports: [TrustService, TRUST_GATE],
})
export class TrustModule {}
