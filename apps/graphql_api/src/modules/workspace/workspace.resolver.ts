import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';
import { Public } from '@sandworm/nest-common';
import { WorkspaceService } from './workspace.service';
import { Workspace } from './model/workspace.model';
import { User } from '../user/model/user.model';
import { Document } from '../document/model/document.model';

@Resolver(() => Workspace)
export class WorkspaceResolver {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Query(() => Workspace, {
    name: 'getWorkspace',
    description: 'Get workspace by ID',
  })
  async getWorkspace(
    @Args('workspaceId', { type: () => String }) workspaceId: string,
  ): Promise<Workspace> {
    return this.workspaceService.getWorkspaceById(workspaceId);
  }

  @Public()
  @Query(() => [Workspace], {
    name: 'getAllUserWorkspaces',
    description: 'Get all User workspaces',
  })
  async getAllWorkspaces(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
  ): Promise<Workspace[]> {
    return this.workspaceService.getAllUserWorkspaces({ limit, offset });
  }

  @Mutation(() => Workspace, {
    name: 'createWorkspace',
    description: 'Create a new workspace',
  })
  async createWorkspace(
    @CurrentUser('id') ownerId: string,
    @Args('name', { type: () => String }) name: string,
  ): Promise<Workspace> {
    return this.workspaceService.createWorkspace({ ownerId, name });
  }

  @Mutation(() => Workspace, {
    name: 'updateWorkspace',
    description: 'Update workspace info',
  })
  async updateWorkspace(
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @Args('name', { type: () => String, nullable: true }) name?: string,
  ): Promise<Workspace> {
    return this.workspaceService.updateWorkspace(workspaceId, { name });
  }

  @ResolveField(() => User)
  async owner(@Parent() workspace: Workspace): Promise<User> {
    return this.workspaceService.getWorkspaceOwner(workspace.ownerId);
  }

  @ResolveField(() => [Document])
  async documentsCount(@Parent() workspace: Workspace): Promise<Document[]> {
    return this.workspaceService.getWorkspaceDocuments(workspace.id);
  }
}
