import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotebookAttestationEntity } from '@sandworm/postgresql-typeorm';
import { DocumentModule } from '../document/document.module';
import { NotebookBlocksModule } from '../notebook-blocks/notebook-blocks.module';
import { TrustResolver } from './trust.resolver';
import { TrustService } from './trust.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotebookAttestationEntity]), NotebookBlocksModule, DocumentModule],
  providers: [TrustResolver, TrustService],
  exports: [TrustService],
})
export class TrustModule {}
