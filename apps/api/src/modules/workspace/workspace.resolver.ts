import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';
import { WorkspaceService } from './workspace.service';
import { Workspace } from './model/workspace.model';
import { User } from '../user/model/graphql/user.model';
import { Document } from '../document/model/document.model';
import { WorkspaceInfo } from './model/workspace-info.model';

@Resolver(() => Workspace)
export class WorkspaceResolver {
  constructor(private readonly workspaceService: WorkspaceService) { }

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
    @CurrentUser('id') userId: string
  ): Promise<Workspace[]> {
    return this.workspaceService.getAllUserWorkspaces(userId);
  }

  @Query(() => WorkspaceInfo, {
    name: 'getUserWorkspaceInfo',
    description: 'Get user workspace info with role',
  })
  async getUserWorkspaceInfo(
    @CurrentUser('id') userId: string,
  ): Promise<WorkspaceInfo> {
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

  @Mutation(() => Boolean, {
    name: 'switchWorkspace',
    description: 'Switch to a different workspace',
  })
  async switchWorkspace(
    @CurrentUser('id') userId: string,
    @Args('workspaceId', { type: () => String }) workspaceId: string,
  ): Promise<boolean> {
    return this.workspaceService.switchWorkspace(userId, workspaceId);
  }

  @ResolveField(() => [User])
  async users(
    @Parent() workspace: Workspace,
    @CurrentUser('id') userId: string,
  ): Promise<User[]> {
    return this.workspaceService.getWorkspaceUsers(workspace.id, userId);
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