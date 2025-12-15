import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
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
import { Workspace } from './model/workspace.model';
import { User } from '../user/model/graphql/user.model';
import { Document } from '../document/model/document.model';
import {
  validateUUID,
  validateNonEmptyString,
  validateStringLength,
} from '@/utils/uuid';
import { WorkspaceInfo } from './model/workspace-info.model';

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

    // Check membership (validates both workspace exists and user has access)
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

    // If no last visited workspace, find or create one
    if (!workspaceId) {
      const userWorkspaces = await this.workspaceRepository.find({
        where: { ownerId: userId },
        order: { createdAt: 'ASC' },
        take: 1,
      });

      if (userWorkspaces.length > 0) {
        workspaceId = userWorkspaces[0].id;
      } else {
        // Create default workspace
        const newWorkspace = await this.createWorkspace({
          ownerId: userId,
          name: user.getTeamName(),
        });
        workspaceId = newWorkspace.id;
      }

      // Update user's last visited workspace
      user.lastVisitedWorkspaceId = workspaceId;
      await this.userRepository.save(user);
    }

    // Get workspace with user's membership in one query
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
}