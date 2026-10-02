import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolCategoryEntity, ToolEntity } from '@sandworm/postgresql-typeorm';
import { ContractAbiService } from './contract-abi.service';
import { ToolSearchService } from './tool-search.service';
import { ToolSeedService } from './tool-seed.service';
import { ToolResolver } from './tool.resolver';
import { ToolService } from './tool.service';

@Module({
  imports: [TypeOrmModule.forFeature([ToolEntity, ToolCategoryEntity]), HttpModule],
  providers: [ToolResolver, ToolService, ToolSearchService, ToolSeedService, ContractAbiService],
  exports: [ToolService],
})
export class ToolModule {}
