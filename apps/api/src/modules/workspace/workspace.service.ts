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

interface PaginationOptions {
  limit?: number;
  offset?: number;
}

@Injectable()
export class WorkspaceService {
  private readonly logger = new Logger(WorkspaceService.name);

  constructor(
      @InjectRepository(WorkspaceEntity)
      private readonly workspaceRepository: Repository<WorkspaceEntity>,
      @InjectRepository(UserWorkspaceEntity)  // Changed from WorkspaceEntity
      private readonly workspaceMembersRepository: Repository<UserWorkspaceEntity>,
      @InjectRepository(UserEntity)
      private readonly userRepository: Repository<UserEntity>,
      @InjectRepository(DocumentEntity)
      private readonly documentRepository: Repository<DocumentEntity>,
  ) {}

 
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

  async getAllUserWorkspaces(
    userId: string,
  ): Promise<Workspace[]> {
    await this.validateAndGetUser(userId, 'User');


    const workspaces = await this.workspaceRepository.find({
      where: { ownerId: userId },
      order: { createdAt: 'DESC' },
    });

    if (!workspaces.length) {
      throw new NotFoundException('No workspaces found for this user');
    }

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
  
    this.logger.log(
      `Created workspace ${savedWorkspace.id} with ADMIN role for user ${data.ownerId}`,
    );
  
    return Workspace.fromEntity(savedWorkspace);
  }
  async getUserWorkspaceInfo(userId: string): Promise<WorkspaceInfo> {
    validateUUID(userId, 'User ID');
  
    const user = await this.validateAndGetUser(userId, 'User');
    let workspaceId = user.lastVisitedWorkspaceId;
    console.log('getUserWorkspaceInfo', workspaceId, userId);
  
    if (!workspaceId) {
      const userWorkspaces = await this.workspaceRepository.find({
        where: { ownerId: userId },
        order: { createdAt: 'ASC' },
        take: 1,
      });
  
      if (userWorkspaces.length > 0) {
        workspaceId = userWorkspaces[0].id;
        user.lastVisitedWorkspaceId = workspaceId;
        await this.userRepository.save(user);
      } else {
        // Create workspace (this now automatically creates UserWorkspace with ADMIN role)
        const newWorkspace = await this.createWorkspace({
          ownerId: userId,
          name: user.getTeamName(),
        });
  
        workspaceId = newWorkspace.id;
        user.lastVisitedWorkspaceId = workspaceId;
        await this.userRepository.save(user);
  
        this.logger.log(
          `Created default workspace ${workspaceId} for user ${userId}`,
        );
      }
    }
  
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });
  
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
  
    const currentUserWorkspaces = await this.workspaceMembersRepository.find({
      where: { userId: userId, workspaceId: workspaceId },
    });
  
    return {
      id: workspace.id,
      name: workspace.name,
      ownerId: workspace.ownerId,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      roles: currentUserWorkspaces.map((member) => ({
        userId: member.userId,
        role: member.role,
      })),
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

  async getWorkspacesByUser(
    userId: string,
    options: PaginationOptions = {},
  ): Promise<Workspace[]> {
    await this.validateAndGetUser(userId, 'User');

    const { limit = 20, offset = 0 } = options;

    const workspaces = await this.workspaceRepository.find({
      where: { ownerId: userId },
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });

    return Workspace.fromEntities(workspaces);
  }
}