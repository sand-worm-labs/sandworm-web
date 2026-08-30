import { Query, Resolver } from '@nestjs/graphql';
import { Public } from '@sandworm/nest-common';
import { Tool } from './tool.model';
import { ToolCategory } from './tool-category.model';
import { ToolService } from './tool.service';

@Resolver(() => Tool)
export class ToolResolver {
  constructor(private readonly toolService: ToolService) { }

  @Public()
  @Query(() => [Tool], {
    name: 'getTools',
    description: 'Get the full power tool catalog (SQL/Python analytics tools available to the notebook)',
  })
  getTools(): Promise<Tool[]> {
    return this.toolService.getTools();
  }

  @Public()
  @Query(() => [ToolCategory], {
    name: 'getToolCategories',
    description: 'Get the power tool category taxonomy',
  })
  getToolCategories(): Promise<ToolCategory[]> {
    return this.toolService.getToolCategories();
  }
}
