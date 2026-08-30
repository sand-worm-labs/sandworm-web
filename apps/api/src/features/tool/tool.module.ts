import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolCategoryEntity, ToolEntity } from '@sandworm/postgresql-typeorm';
import { ToolSeedService } from './tool-seed.service';
import { ToolResolver } from './tool.resolver';
import { ToolService } from './tool.service';

@Module({
  imports: [TypeOrmModule.forFeature([ToolEntity, ToolCategoryEntity])],
  providers: [ToolResolver, ToolService, ToolSeedService],
  exports: [ToolService],
})
export class ToolModule {}
