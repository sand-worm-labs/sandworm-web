import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  WorkspaceEntity,
  UserWorkspaceEntity,
  UserEntity,
  DocumentEntity,
  UserWorkspaceRole,
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

    const workspaces = await this.workspaceRepository.find({
      where: { ownerId: userId },
      order: { createdAt: 'DESC' },
    });

    return Workspace.fromEntities(workspaces);
  }

  async createWorkspace(data: {
    ownerId: string;
    name: string;
  }): Promise<Workspace> {
    validateUUID(data.ownerId, 'Owner ID');
    validateNonEmptyString(data.name, 'Workspace name');
    validateStringLength(data.name, 'Workspace name', 255);

    await this.validateAndGetUser(data.ownerId, 'Owner');

    const workspace = this.workspaceRepository.create({
      name: data.name.trim(),
      ownerId: data.ownerId,
    });

    const savedWorkspace = await this.workspaceRepository.save(workspace);

    const userWorkspace = this.workspaceMembersRepository.create({
      userId: data.ownerId,
      workspaceId: savedWorkspace.id,
      role: UserWorkspaceRole.ADMIN,
      inviterId: null,
    });

    await this.workspaceMembersRepository.save(userWorkspace);

    return Workspace.fromEntity(savedWorkspace);
  }

  async switchWorkspace(
    userId: string,
    workspaceId: string,
  ): Promise<boolean> {
    validateUUID(userId, 'User ID');
    validateUUID(workspaceId, 'Workspace ID');

    const user = await this.validateAndGetUser(userId, 'User');

    const membership = await this.workspaceMembersRepository.findOne({
      where: { userId, workspaceId },
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
      where: { userId, workspaceId },
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
      where: { workspaceId, userId },
    });

    if (!userMembership) {
      throw new BadRequestException(
        'You must be a member of this workspace to view its users',
      );
    }

    const memberships = await this.workspaceMembersRepository.find({
      where: { workspaceId },
      relations: ['user'],
    });

    const users = memberships.map(membership => membership.user);
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
      where: { workspaceId, userId: inviterId },
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

    const existingMembership = await this.workspaceMembersRepository.findOne({
      where: { workspaceId, userId: invitedUser.id },
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

    await this.mailService.workspaceInvitation({
      to: email,
      data: {
        hash,
        workspaceName: workspace.name,
        inviterName: (await this.userRepository.findOne({ where: { id: inviterId } }))?.firstName || 'Someone',
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
      throw new BadRequestException('User is already a member of this workspace');
    }

    const userWorkspace = this.workspaceMembersRepository.create({
      userId,
      workspaceId,
      role,
      inviterId,
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
      where: { workspaceId, userId },
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
      where: { workspaceId, userId: adminId },
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
      where: { workspaceId, userId: userIdToRemove },
    });

    if (!membership) {
      throw new NotFoundException('User is not a member of this workspace');
    }

    await this.workspaceMembersRepository.remove(membership);
  }

  async getWorkspaceMembers(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMember[]> {
    validateUUID(workspaceId, 'Workspace ID');
    validateUUID(userId, 'User ID');

    const membership = await this.workspaceMembersRepository.findOne({
      where: { workspaceId, userId },
    });

    if (!membership) {
      return [];
    }

    const memberships = await this.workspaceMembersRepository.find({
      where: { workspaceId },
      relations: ['user'],
    });

    return memberships.map(membership => {
      const workspaceMember = new WorkspaceMember();
      workspaceMember.userId = membership.userId;
      workspaceMember.role = membership.role;
      workspaceMember.user = membership.user ? User.fromEntity(membership.user) : undefined;
      return workspaceMember;
    });
  }
}