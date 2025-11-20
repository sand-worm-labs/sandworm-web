import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity, WorkspaceEntity } from '@sandworm/postgresql-typeorm';
import { AuthModule } from '../auth/auth.module';
import { DocumentResolver } from './document.resolver';
import { DocumentService } from './document.service';
@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity, WorkspaceEntity]), AuthModule],
  providers: [DocumentResolver, DocumentService],
})
export class DocumentModule { }
