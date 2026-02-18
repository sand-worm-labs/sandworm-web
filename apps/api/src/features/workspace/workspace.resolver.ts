import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';
import { UserWorkspaceRole } from '@sandworm/postgresql-typeorm';
import { WorkspaceService } from './service/workspace.service';
import { Workspace, WorkspaceSecrets, WorkspaceInvitationInfo } from './model/workspace.model';
import { User } from '../user/model/graphql/user.model';
import { Document } from '../document/model/document.model';
import { WorkspaceInfo, WorkspaceMember } from './model/workspace-info.model';
import { Public } from '@sandworm/nest-common';
import { WorkspaceMembershipService } from './service/workspace-membership.service';

@Resolver(() => Workspace)
export class WorkspaceResolver {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly workspaceMembershipService: WorkspaceMembershipService,
  ) { }

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

  @Query(() => [WorkspaceMember], {
    name: 'getWorkspaceMembers',
    description: 'Get workspace members',
  })
  async getWorkspaceMembers(
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @CurrentUser('id') userId: string
  ): Promise<WorkspaceMember[]> {
    return this.workspaceMembershipService.getWorkspaceMembers(workspaceId, userId);
  }

  @Query(() => [WorkspaceMember], {
    name: 'getPendingInvites',
    description: 'Get all pending join requests for a workspace',
  })
  async getPendingInvites(
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @CurrentUser('id') userId: string,
  ): Promise<WorkspaceMember[]> {
    return this.workspaceMembershipService.getPendingInvites(workspaceId, userId);
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

  @Mutation(() => Boolean, {
    name: 'deleteWorkspace',
    description: 'Delete a workspace',
  })
  async deleteWorkspace(
    @CurrentUser('id') ownerId: string,
    @Args('workspaceId', { type: () => String }) workspaceId: string,
  ): Promise<boolean> {
    await this.workspaceService.deleteWorkspace(workspaceId, ownerId);
    return true;
  }

  @Public()
  @Mutation(() => Boolean, {
    name: 'joinWorkspace',
    description: 'Join a workspace',
  })
  async joinWorkspace(
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @Args('email', { type: () => String }) email: string,
    @Args('role', { type: () => UserWorkspaceRole, defaultValue: UserWorkspaceRole.VIEWER }) role: UserWorkspaceRole,
  ): Promise<boolean> {
    await this.workspaceMembershipService.joinWorkspace(workspaceId, email, role);
    return true;
  }

  @Mutation(() => Workspace, {
    name: 'updateWorkspace',
    description: 'Update workspace info',
  })
  async updateWorkspace(
    @CurrentUser('id') ownerId: string,
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @Args('name', { type: () => String, nullable: true }) name?: string,
    @Args('icon', { type: () => String, nullable: true }) icon?: string,
  ): Promise<Workspace> {
    return this.workspaceService.updateWorkspace(workspaceId, { name, ownerId, icon });
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

  @Mutation(() => Boolean, {
    name: 'removeUserFromWorkspace',
    description: 'Remove a user from workspace',
  })
  async removeUserFromWorkspace(
    @CurrentUser('id') adminId: string,
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @Args('userId', { type: () => String }) userIdtoRemove: string,
  ): Promise<boolean> {
    await this.workspaceMembershipService.softRemoveUserFromWorkspace(
      workspaceId,
      userIdtoRemove,
      adminId,
    );
    return true;
  }


  @Mutation(() => Boolean, {
    name: 'batchRemoveUsersFromWorkspace',
    description: 'Remove multiple users from a workspace',
  })
  async batchRemoveUsersFromWorkspace(
    @CurrentUser('id') adminId: string,
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @Args('userIds', { type: () => [String] }) userIds: string[],
  ): Promise<boolean> {
    await Promise.all(
      userIds.map((userId) =>
        this.workspaceMembershipService.softRemoveUserFromWorkspace(
          workspaceId,
          userId,
          adminId,
        ),
      ),
    );
    return true;
  }

  @Mutation(() => Boolean, {
    name: 'inviteUserToWorkspace',
    description: 'Invite a user to workspace by email',
  })
  async inviteUserToWorkspace(
    @CurrentUser('id') inviterId: string,
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @Args('email', { type: () => String }) email: string,
    @Args('role', { type: () => String, nullable: true }) role?: string,
  ): Promise<boolean> {
    const userRole = (role as UserWorkspaceRole) || UserWorkspaceRole.VIEWER;
    await this.workspaceMembershipService.inviteUserToWorkspace(
      workspaceId,
      email,
      inviterId,
      userRole,
    );
    return true;
  }

  @Public()
  @Mutation(() => Boolean, {
    name: 'acceptWorkspaceInvitation',
    description: 'Accept workspace invitation with hash from email',
  })
  async acceptWorkspaceInvitation(
    @Args('hash', { type: () => String }) hash: string,
  ): Promise<boolean> {
    await this.workspaceMembershipService.acceptWorkspaceInvitation(hash);
    return true;
  }

  @Mutation(() => Boolean, {
    name: 'acceptPendingInvite',
    description: 'Accept a pending join request',
  })
  async acceptPendingInvite(
    @CurrentUser('id') inviterId: string,
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @Args('userId', { type: () => String }) userId: string,
  ): Promise<boolean> {
    await this.workspaceMembershipService.acceptPendingInvite(workspaceId, userId, inviterId);
    return true;
  }

  @Mutation(() => Boolean, {
    name: 'rejectPendingInvite',
    description: 'Reject a pending join request',
  })
  async rejectPendingInvite(
    @CurrentUser('id') rejectedById: string,
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @Args('userId', { type: () => String }) userId: string,

  ): Promise<boolean> {
    await this.workspaceMembershipService.rejectPendingInvite(workspaceId, userId, rejectedById);
    return true;
  }

  @Public()
  @Query(() => WorkspaceInvitationInfo, {
    description: 'Get invitation details from hash without accepting it',
  })
  async getInvitationInfo(
    @Args('hash', { type: () => String }) hash: string,
  ): Promise<WorkspaceInvitationInfo> {
    return await this.workspaceMembershipService.getInvitationInfo(hash);
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

  @ResolveField(() => WorkspaceSecrets)
  async secrets(@Parent() workspace: Workspace): Promise<WorkspaceSecrets> {
    return { hasExternalModelApiKey: false };
  }
}