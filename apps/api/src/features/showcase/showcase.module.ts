import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DocumentEntity,
  ShowcaseCategoryEntity,
  ShowcaseChainEntity,
  ShowcaseGroupEntity,
  ShowcaseLeadEntity,
  ShowcaseTemplateEntity,
} from '@sandworm/postgresql-typeorm';
import { WorkspaceModule } from '../workspace/workspace.module';
import { ShowcaseAdminService } from './showcase-admin.service';
import { ShowcaseResolver } from './showcase.resolver';
import { ShowcaseService } from './showcase.service';

@Module({
  imports: [TypeOrmModule.forFeature([
      DocumentEntity,
      ShowcaseLeadEntity,
      ShowcaseGroupEntity,
      ShowcaseCategoryEntity,
      ShowcaseChainEntity,
      ShowcaseTemplateEntity,
    ]), forwardRef(() => WorkspaceModule)],
  providers: [ShowcaseResolver, ShowcaseService, ShowcaseAdminService],
})
export class ShowcaseModule {}
