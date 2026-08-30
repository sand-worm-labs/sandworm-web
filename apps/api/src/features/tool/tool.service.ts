import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ToolCategoryEntity, ToolEntity } from '@sandworm/postgresql-typeorm';
import { Repository } from 'typeorm';
import { Tool } from './tool.model';
import { ToolCategory } from './tool-category.model';

@Injectable()
export class ToolService {
  constructor(
    @InjectRepository(ToolEntity)
    private readonly toolRepository: Repository<ToolEntity>,
    @InjectRepository(ToolCategoryEntity)
    private readonly toolCategoryRepository: Repository<ToolCategoryEntity>,
  ) { }

  async getTools(): Promise<Tool[]> {
    const entities = await this.toolRepository.find();
    return Tool.fromEntities(entities);
  }

  async getToolCategories(): Promise<ToolCategory[]> {
    const entities = await this.toolCategoryRepository.find();
    return ToolCategory.fromEntities(entities);
  }
}
