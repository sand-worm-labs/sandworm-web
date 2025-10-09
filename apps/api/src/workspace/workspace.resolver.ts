import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { WorkspaceService } from './workspace.service';
import { Workspace } from './entities/workspace.entity';
import { CreateWorkspaceInput } from './dto/create-workspace.input';
import { UpdateWorkspaceInput } from './dto/update-workspace.input';

@Resolver(() => Workspace)
export class WorkspaceResolver {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Mutation(() => Workspace)
  createWorkspace(@Args('createWorkspaceInput') createWorkspaceInput: CreateWorkspaceInput) {
    return this.workspaceService.create(createWorkspaceInput);
  }

  @Query(() => [Workspace], { name: 'workspace' })
  findAll() {
    return this.workspaceService.findAll();
  }

  @Query(() => Workspace, { name: 'workspace' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.workspaceService.findOne(id);
  }

  @Mutation(() => Workspace)
  updateWorkspace(@Args('updateWorkspaceInput') updateWorkspaceInput: UpdateWorkspaceInput) {
    return this.workspaceService.update(updateWorkspaceInput.id, updateWorkspaceInput);
  }

  @Mutation(() => Workspace)
  removeWorkspace(@Args('id', { type: () => Int }) id: number) {
    return this.workspaceService.remove(id);
  }
}
