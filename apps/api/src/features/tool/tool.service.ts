import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ToolCategoryEntity, ToolEntity } from '@sandworm/postgresql-typeorm';
import {
  ParamDefinition,
  ResolvedParams,
  ToolDefinition,
  renderTool,
} from '@sandworm/editor';
import { ValidationException } from '@sandworm/graphql';
import { Repository } from 'typeorm';
import { ErrorCode } from '@/constants/error-code.constant';
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

  // Renders a tool's template server-side and returns only the resulting
  // generatedSource — the raw template (the tool's actual implementation)
  // never leaves the backend. Shared by both the manual param-form path and
  // the AI block-creation path, so a tool's rendering behavior only lives
  // in one place (@sandworm/editor's renderTool).
  async renderToolSource(toolId: string, inputs: Record<string, unknown>): Promise<string> {
    const entity = await this.toolRepository.findOneBy({ toolId });
    if (!entity) {
      throw new ValidationException(ErrorCode.E003);
    }

    const definition: ToolDefinition = {
      id: entity.toolId,
      templateId: entity.toolId,
      categoryId: entity.categoryId,
      name: entity.name,
      description: entity.description,
      tags: entity.tags,
      uiHint: 'form',
      params: entity.params as ParamDefinition[],
    };

    const result = renderTool(definition, entity.template, inputs as ResolvedParams);
    return result.source;
  }

  async getToolCategories(): Promise<ToolCategory[]> {
    const entities = await this.toolCategoryRepository.find();
    return ToolCategory.fromEntities(entities);
  }
}
