import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DocumentEntity,
  ShowcaseCategoryEntity,
  ShowcaseChainEntity,
  ShowcaseGroupEntity,
  ShowcaseLeadEntity,
  ShowcaseProtocolLogoEntity,
  ShowcaseTemplateEntity,
} from '@sandworm/postgresql-typeorm';
import { WorkspaceModule } from '../workspace/workspace.module';
import { ShowcaseAdminService } from './showcase-admin.service';
import { ShowcaseLogoController } from './showcase-logo.controller';
import { ShowcaseLogoService } from './showcase-logo.service';
import { ShowcaseResolver } from './showcase.resolver';
import { ShowcaseService } from './showcase.service';

@Module({
  imports: [TypeOrmModule.forFeature([
      DocumentEntity,
      ShowcaseLeadEntity,
      ShowcaseGroupEntity,
      ShowcaseCategoryEntity,
      ShowcaseChainEntity,
      ShowcaseProtocolLogoEntity,
      ShowcaseTemplateEntity,
    ]), forwardRef(() => WorkspaceModule)],
  controllers: [ShowcaseLogoController],
  providers: [ShowcaseResolver, ShowcaseService, ShowcaseAdminService, ShowcaseLogoService],
})
export class ShowcaseModule {}
