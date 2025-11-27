import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity, WorkspaceEntity, FavoriteEntity } from '@sandworm/postgresql-typeorm';
import { AuthModule } from '../auth-graphql/auth.module';
import { DocumentResolver } from './document.resolver';
import { DocumentService } from './document.service';
@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity, WorkspaceEntity, FavoriteEntity]), AuthModule],
  providers: [DocumentResolver, DocumentService],
})
export class DocumentModule { }
