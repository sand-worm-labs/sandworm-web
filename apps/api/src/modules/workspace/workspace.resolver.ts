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
import { User } from '../user/model/graphql/user.model';
import { Document } from '../document/model/document.model';
import { WorkspaceInfo } from './model/workspace-info.model';

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

  @Query(() => [Workspace], {
    name: 'getUserWorkspaces',
    description: 'Get User workspaces',
  })
  async getUserWorkspaces(
    @CurrentUser('id') userId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
  ): Promise<Workspace[]> {
    return this.workspaceService.getAllUserWorkspaces(userId,{ limit, offset });
  }

  @Query(() => WorkspaceInfo, {
    name: 'getUserWorkspaceInfo',
    description: 'Get user workspace info with roles',
  })
  async getUserWorkspaceInfo(
    @CurrentUser('id') userId: string,
  ): Promise<WorkspaceInfo> {
    console.log('getUserWorkspaceInfo', userId);
    return this.workspaceService.getUserWorkspaceInfo(userId);
  }

  @Mutation(() => Workspace, {
    name: 'createWorkspace',
    description: 'Create a new workspace',
  })
  async createWorkspace(
    @CurrentUser('id') ownerId: string,
    @Args('name', { type: () => String }) name: string,
  ): Promise<Workspace> {
    if (!ownerId) {
      throw new Error('ownerId is missing from authentication token');
    }
  
    return this.workspaceService.createWorkspace({ ownerId, name });
  }

  @Mutation(() => Workspace, {
    name: 'updateWorkspace',
    description: 'Update workspace info',
  })
  async updateWorkspace(
    @CurrentUser('id') ownerId: string,
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @Args('name', { type: () => String, nullable: true }) name?: string,
  ): Promise<Workspace> {
    return this.workspaceService.updateWorkspace(workspaceId, { name, ownerId });
  }

  @ResolveField(() => User)
  async owner(@Parent() workspace: Workspace): Promise<User> {
    return this.workspaceService.getWorkspaceOwner(workspace.ownerId);
  }

  @ResolveField(() => [Document])
  async documents(@Parent() workspace: Workspace): Promise<Document[]> {
    return this.workspaceService.getWorkspaceDocuments(workspace.id);
  }
}
