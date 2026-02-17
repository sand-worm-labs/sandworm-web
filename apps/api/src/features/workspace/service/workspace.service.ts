import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Equal, In, Or, Repository } from 'typeorm';
import {
  WorkspaceEntity,
  UserWorkspaceEntity,
  UserEntity,
  DocumentEntity,
  UserWorkspaceRole,
  UserWorkspaceStatus,
} from '@sandworm/postgresql-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@/config/config.type';
import { MailService } from '@/infrastructure/mail/mail.service';
import { Workspace } from '../model/workspace.model';
import { User } from '../../user/model/graphql/user.model';
import { Document } from '../../document/model/document.model';
import {
  validateUUID,
  validateNonEmptyString,
  validateStringLength,
} from '@/common/utils/uuid';
import { WorkspaceInfo, WorkspaceMember } from '../model/workspace-info.model';

@Injectable()
export class WorkspaceService {
  private readonly logger = new Logger(WorkspaceService.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly workspaceMembersRepository: Repository<UserWorkspaceEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService<AllConfigType>,
  ) { }

  private async validateAndGetUser(
    userId: string,
    fieldName: string = 'User',
  ): Promise<UserEntity> {
    validateUUID(userId, `${fieldName} ID`);

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`${fieldName} not found`);
    }

    return user;
  }


  async getWorkspaceById(workspaceId: string): Promise<Workspace> {
    validateUUID(workspaceId, 'Workspace ID');

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return Workspace.fromEntity(workspace);
  }

  async getAllUserWorkspaces(userId: string): Promise<Workspace[]> {
    await this.validateAndGetUser(userId, 'User');

    const userWorkspaces = await this.workspaceMembersRepository.find({
      where: { userId: userId, status: UserWorkspaceStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });

    const workspaceIds = userWorkspaces.map((uw) => uw.workspaceId);

    if (workspaceIds.length === 0) {
      return [];
    }

    const workspaces = await this.workspaceRepository.find({
      where: { id: In(workspaceIds) },
    });

    return Workspace.fromEntities(workspaces);
  }

  async createWorkspace(data: { ownerId: string; name: string }): Promise<Workspace> {
    validateUUID(data.ownerId, 'Owner ID');
    validateNonEmptyString(data.name, 'Workspace name');
    validateStringLength(data.name, 'Workspace name', 255);

    await this.validateAndGetUser(data.ownerId, 'Owner');

    const workspace = this.workspaceRepository.create({
      icon: `blue`,
      name: data.name.trim(),
      ownerId: data.ownerId,
    });

    const savedWorkspace = await this.workspaceRepository.save(workspace);

    const userWorkspace = this.workspaceMembersRepository.create({
      userId: data.ownerId,
      workspaceId: savedWorkspace.id,
      role: UserWorkspaceRole.ADMIN,
      inviterId: null,
      status: UserWorkspaceStatus.ACTIVE,
    });

    await this.workspaceMembersRepository.save(userWorkspace);

    return Workspace.fromEntity(savedWorkspace);
  }

  async deleteWorkspace(workspaceId: string, ownerId: string): Promise<void> {
    validateUUID(workspaceId, 'Workspace ID');
    validateUUID(ownerId, 'Owner ID');

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId, ownerId },
    });

    if (!workspace) {
      throw new NotFoundException(
        'Workspace not found or you do not have permission to delete it',
      );
    }

    await this.workspaceRepository.remove(workspace);
  }

  async switchWorkspace(userId: string, workspaceId: string): Promise<boolean> {
    validateUUID(userId, 'User ID');
    validateUUID(workspaceId, 'Workspace ID');

    const user = await this.validateAndGetUser(userId, 'User');

    const membership = await this.workspaceMembersRepository.findOne({
      where: { userId, workspaceId, status: UserWorkspaceStatus.ACTIVE },
    });

    if (!membership) {
      return false;
    }

    user.lastVisitedWorkspaceId = workspaceId;
    await this.userRepository.save(user);

    return true;
  }

  async getUserWorkspaceInfo(userId: string): Promise<WorkspaceInfo> {
    validateUUID(userId, 'User ID');

    const user = await this.validateAndGetUser(userId, 'User');
    let workspaceId = user.lastVisitedWorkspaceId;

    if (!workspaceId) {
      const userWorkspaces = await this.workspaceRepository.find({
        where: { ownerId: userId },
        order: { createdAt: 'ASC' },
        take: 1,
      });

      if (userWorkspaces.length > 0) {
        workspaceId = userWorkspaces[0].id;
      } else {
        const newWorkspace = await this.createWorkspace({
          ownerId: userId,
          name: user.getTeamName(),
        });
        workspaceId = newWorkspace.id;
      }

      user.lastVisitedWorkspaceId = workspaceId;
      await this.userRepository.save(user);
    }

    const membership = await this.workspaceMembersRepository.findOne({
      where: { userId, workspaceId, status: UserWorkspaceStatus.ACTIVE },
      relations: ['workspace'],
    });

    if (!membership || !membership.workspace) {
      throw new NotFoundException('Workspace not found or user not a member');
    }

    const workspace = membership.workspace;

    return {
      id: workspace.id,
      name: workspace.name,
      ownerId: workspace.ownerId,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      role: membership.role,
    };
  }

  async getWorkspaceUsers(workspaceId: string, userId: string): Promise<User[]> {
    validateUUID(workspaceId, 'Workspace ID');
    validateUUID(userId, 'User ID');

    await this.validateAndGetUser(userId, 'User');

    const userMembership = await this.workspaceMembersRepository.findOne({
      where: { workspaceId, userId, status: UserWorkspaceStatus.ACTIVE },
    });

    if (!userMembership || userMembership.status !== UserWorkspaceStatus.ACTIVE) {
      throw new BadRequestException(
        'You must be a member of this workspace to view its users',
      );
    }

    const memberships = await this.workspaceMembersRepository.find({
      where: { workspaceId, status: UserWorkspaceStatus.ACTIVE },
      relations: ['user'],
    });

    const users = memberships.map((membership) => membership.user);
    return User.fromEntities(users);
  }

  async updateWorkspace(
    workspaceId: string,
    data: { name?: string; ownerId?: string },
  ): Promise<Workspace> {
    validateUUID(workspaceId, 'Workspace ID');

    if (!data.ownerId) {
      throw new BadRequestException('Owner ID is required');
    }
    validateUUID(data.ownerId, 'Owner ID');

    if (data.name !== undefined) {
      validateNonEmptyString(data.name, 'Workspace name');
      validateStringLength(data.name, 'Workspace name', 255);
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId, ownerId: data.ownerId },
    });

    if (!workspace) {
      throw new NotFoundException(
        'Workspace not found or you do not have permission to update it',
      );
    }

    if (data.name) {
      workspace.name = data.name.trim();
    }

    const updatedWorkspace = await this.workspaceRepository.save(workspace);

    return Workspace.fromEntity(updatedWorkspace);
  }

  async getWorkspaceOwner(ownerId: string): Promise<User> {
    const owner = await this.validateAndGetUser(ownerId, 'Owner');
    return User.fromEntity(owner);
  }

  async getWorkspaceDocuments(workspaceId: string): Promise<Document[]> {
    validateUUID(workspaceId, 'Workspace ID');

    const documents = await this.documentRepository.find({
      where: { workspaceId },
    });

    return Document.fromEntities(documents);
  }

  async getWorkspacesByUser(userId: string): Promise<Workspace[]> {
    await this.validateAndGetUser(userId, 'User');

    const workspaces = await this.workspaceRepository.find({
      where: { ownerId: userId },
      order: { createdAt: 'DESC' },
    });

    return Workspace.fromEntities(workspaces);
  }

  async inviteUserToWorkspace(
    workspaceId: string,
    email: string,
    inviterId: string,
    role: UserWorkspaceRole = UserWorkspaceRole.VIEWER,
  ): Promise<void> {
    validateUUID(workspaceId, 'Workspace ID');
    validateUUID(inviterId, 'Inviter ID');
    validateNonEmptyString(email, 'Email');

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const inviterMembership = await this.workspaceMembersRepository.findOne({
      where: { workspaceId, userId: inviterId, status: UserWorkspaceStatus.ACTIVE },
    });

    if (!inviterMembership || inviterMembership.role !== UserWorkspaceRole.ADMIN) {
      throw new BadRequestException('Only workspace admins can invite users');
    }

    const invitedUser = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!invitedUser) {
      throw new NotFoundException('User with this email does not exist');
    }

    if (invitedUser.id === inviterId) {
      throw new BadRequestException('You cannot invite yourself');
    }

    const existingMembership = await this.workspaceMembersRepository.findOne({
      where: {
        workspaceId,
        userId: invitedUser.id,
        status: Or(Equal(UserWorkspaceStatus.ACTIVE), Equal(UserWorkspaceStatus.PENDING)),
      },
    });

    if (existingMembership) {
      throw new BadRequestException('User is already a member of this workspace');
    }

    const authConfig = this.configService.getOrThrow('auth', { infer: true });
    const hash = await this.jwtService.signAsync(
      {
        workspaceId,
        userId: invitedUser.id,
        inviterId,
        role,
      },
      {
        secret: authConfig.confirmEmailSecret,
        expiresIn: '7d',
      },
    );

    const inviter = await this.userRepository.findOne({ where: { id: inviterId } });

    await this.mailService.workspaceInvitation({
      to: email,
      data: {
        hash,
        workspaceName: workspace.name,
        inviterName: inviter?.firstName || 'Someone',
      },
    });
  }

  async acceptWorkspaceInvitation(hash: string): Promise<void> {
    const authConfig = this.configService.getOrThrow('auth', { infer: true });

    let workspaceId: string;
    let userId: string;
    let inviterId: string;
    let role: UserWorkspaceRole;

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        workspaceId: string;
        userId: string;
        inviterId: string;
        role: UserWorkspaceRole;
      }>(hash, {
        secret: authConfig.confirmEmailSecret,
      });

      workspaceId = jwtData.workspaceId;
      userId = jwtData.userId;
      inviterId = jwtData.inviterId;
      role = jwtData.role;
    } catch {
      throw new UnprocessableEntityException('Invalid or expired invitation');
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const existingMembership = await this.workspaceMembersRepository.findOne({
      where: { workspaceId, userId },
    });

    if (existingMembership) {
      if (existingMembership.status === UserWorkspaceStatus.ACTIVE) {
        throw new BadRequestException('User is already a member of this workspace');
      }

      existingMembership.status = UserWorkspaceStatus.ACTIVE;
      existingMembership.role = role;
      existingMembership.inviterId = inviterId;
      await this.workspaceMembersRepository.save(existingMembership);
      return;
    }

    const userWorkspace = this.workspaceMembersRepository.create({
      userId,
      workspaceId,
      role,
      inviterId,
      status: UserWorkspaceStatus.ACTIVE,
    });

    await this.workspaceMembersRepository.save(userWorkspace);
  }

  async getInvitationInfo(hash: string): Promise<{
    workspace: Workspace;
    inviter: User;
    invitedUser: User;
    role: UserWorkspaceRole;
  }> {
    const authConfig = this.configService.getOrThrow('auth', { infer: true });

    let workspaceId: string;
    let userId: string;
    let inviterId: string;
    let role: UserWorkspaceRole;

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        workspaceId: string;
        userId: string;
        inviterId: string;
        role: UserWorkspaceRole;
      }>(hash, {
        secret: authConfig.confirmEmailSecret,
      });

      workspaceId = jwtData.workspaceId;
      userId = jwtData.userId;
      inviterId = jwtData.inviterId;
      role = jwtData.role;
    } catch {
      throw new UnprocessableEntityException('Invalid or expired invitation');
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const inviter = await this.userRepository.findOne({
      where: { id: inviterId },
    });

    if (!inviter) {
      throw new NotFoundException('Inviter not found');
    }

    const invitedUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!invitedUser) {
      throw new NotFoundException('Invited user not found');
    }

    const existingMembership = await this.workspaceMembersRepository.findOne({
      where: { workspaceId, userId, status: UserWorkspaceStatus.ACTIVE },
    });

    if (existingMembership) {
      throw new BadRequestException('User is already a member of this workspace');
    }

    return {
      workspace: Workspace.fromEntity(workspace),
      inviter: User.fromEntity(inviter),
      invitedUser: User.fromEntity(invitedUser),
      role,
    };
  }

  async removeUserFromWorkspace(
    workspaceId: string,
    userIdToRemove: string,
    adminId: string,
  ): Promise<void> {
    validateUUID(workspaceId, 'Workspace ID');
    validateUUID(userIdToRemove, 'User ID to remove');
    validateUUID(adminId, 'Admin ID');

    const adminMembership = await this.workspaceMembersRepository.findOne({
      where: { workspaceId, userId: adminId, status: UserWorkspaceStatus.ACTIVE },
    });

    if (!adminMembership || adminMembership.role !== UserWorkspaceRole.ADMIN) {
      throw new BadRequestException('Only workspace admins can remove users');
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (workspace?.ownerId === userIdToRemove) {
      throw new BadRequestException('Cannot remove workspace owner');
    }

    const membership = await this.workspaceMembersRepository.findOne({
      where: { workspaceId, userId: userIdToRemove, status: UserWorkspaceStatus.ACTIVE },
    });

    if (!membership) {
      throw new NotFoundException('User is not a member of this workspace');
    }

    await this.workspaceMembersRepository.remove(membership);
  }

  async updateMemberRole(
    workspaceId: string,
    targetUserId: string,
    adminId: string,
    newRole: UserWorkspaceRole,
  ): Promise<void> {
    validateUUID(workspaceId, 'Workspace ID');
    validateUUID(targetUserId, 'Target User ID');
    validateUUID(adminId, 'Admin ID');

    if (targetUserId === adminId) {
      throw new BadRequestException('You cannot change your own role');
    }

    const adminMembership = await this.workspaceMembersRepository.findOne({
      where: { workspaceId, userId: adminId, status: UserWorkspaceStatus.ACTIVE },
    });

    if (!adminMembership || adminMembership.role !== UserWorkspaceRole.ADMIN) {
      throw new BadRequestException('Only workspace admins can change roles');
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (workspace?.ownerId === targetUserId) {
      throw new BadRequestException('Cannot change workspace owner role');
    }

    const targetMembership = await this.workspaceMembersRepository.findOne({
      where: { workspaceId, userId: targetUserId, status: UserWorkspaceStatus.ACTIVE },
    });

    if (!targetMembership) {
      throw new NotFoundException('User is not an active member of this workspace');
    }

    targetMembership.role = newRole;
    await this.workspaceMembersRepository.save(targetMembership);
  }

  async getWorkspaceMembers(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMember[]> {
    validateUUID(workspaceId, 'Workspace ID');
    validateUUID(userId, 'User ID');

    const membership = await this.workspaceMembersRepository.findOne({
      where: { workspaceId, userId, status: UserWorkspaceStatus.ACTIVE },
    });

    if (!membership) {
      return [];
    }

    const memberships = await this.workspaceMembersRepository.find({
      where: { workspaceId, status: UserWorkspaceStatus.ACTIVE },
      relations: ['user'],
    });

    return memberships.map((membership) => {
      const workspaceMember = new WorkspaceMember();
      workspaceMember.userId = membership.userId;
      workspaceMember.role = membership.role;
      workspaceMember.user = membership.user ? User.fromEntity(membership.user) : undefined;
      return workspaceMember;
    });
  }

  async joinWorkspace(
    workspaceId: string,
    email: string,
    role: UserWorkspaceRole = UserWorkspaceRole.VIEWER,
  ): Promise<void> {
    validateUUID(workspaceId, 'Workspace ID');
    validateNonEmptyString(email, 'Email');

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      relations: ['owner'],
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    const existingMembership = await this.workspaceMembersRepository.findOne({
      where: {
        workspaceId,
        userId: user.id,
        status: Or(Equal(UserWorkspaceStatus.ACTIVE), Equal(UserWorkspaceStatus.PENDING)),
      },
    });

    if (existingMembership) {
      throw new BadRequestException('User is already a member of this workspace');
    }

    const userWorkspace = this.workspaceMembersRepository.create({
      userId: user.id,
      workspaceId,
      role,
      inviterId: null,
      status: UserWorkspaceStatus.PENDING,
    });

    await this.workspaceMembersRepository.save(userWorkspace);

    await this.mailService.workspaceJoinRequest({
      to: workspace.owner.email,
      data: {
        userName: user.firstName || user.email,
        userEmail: user.email,
        workspaceName: workspace.name,
        workspaceId: workspace.id,
        role,
      },
    });
  }
}