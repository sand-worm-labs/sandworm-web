import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { WorkspaceEntity, UserEntity, DocumentEntity } from '@sandworm/postgresql-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Workspace } from './model/workspace.model';
import { User } from '../user/model/graphql/user.model';
import { Document } from '../document/model/document.model';
import { toGraphQLWorkspaceUtils } from '@/utils/models';
import { validateUUID, validateNonEmptyString, validateStringLength } from '@/utils/uuid';

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
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
  ) {}

  /**
   * Validates and retrieves a user by ID
   */
  private async validateAndGetUser(userId: string, fieldName: string = 'User'): Promise<UserEntity> {
    validateUUID(userId, `${fieldName} ID`);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException(`${fieldName} not found`);
    }

    return user;
  }

  async getWorkspaceById(workspaceId: string): Promise<Workspace> {
    validateUUID(workspaceId, 'Workspace ID');

    const workspace = await this.workspaceRepository.findOne({ where: { id: workspaceId } });
    
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return this.toGraphQLWorkspace(workspace);
  }

  async getAllUserWorkspaces(userId: string, options: PaginationOptions): Promise<Workspace[]> {
    await this.validateAndGetUser(userId, 'User');

    const { limit = 20, offset = 0 } = options;
    
    const workspaces = await this.workspaceRepository.find({
      where: { ownerId: userId },
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });

    if (!workspaces.length) {
      throw new NotFoundException('No workspaces found for this user');
    }

    return workspaces.map((ws) => this.toGraphQLWorkspace(ws));
  }

  async createWorkspace(data: { ownerId: string; name: string }): Promise<Workspace> {
    validateUUID(data.ownerId, 'Owner ID');
    validateNonEmptyString(data.name, 'Workspace name');
    validateStringLength(data.name, 'Workspace name', 255);

    await this.validateAndGetUser(data.ownerId, 'Owner');

    const workspace = this.workspaceRepository.create({
      name: data.name.trim(),
      ownerId: data.ownerId,
    });

    const savedWorkspace = await this.workspaceRepository.save(workspace);

    return this.toGraphQLWorkspace(savedWorkspace);
  }

  async updateWorkspace(
    workspaceId: string, 
    data: { name?: string; ownerId?: string }
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
      where: { id: workspaceId, ownerId: data.ownerId } 
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found or you do not have permission to update it');
    }

    if (data.name) {
      workspace.name = data.name.trim();
    }

    const updatedWorkspace = await this.workspaceRepository.save(workspace);

    return this.toGraphQLWorkspace(updatedWorkspace);
  }

  async getWorkspaceOwner(ownerId: string): Promise<User> {
    const owner = await this.validateAndGetUser(ownerId, 'Owner');
    return User.fromEntity(owner);
  }

  async getWorkspaceDocuments(workspaceId: string): Promise<Document[]> {
    validateUUID(workspaceId, 'Workspace ID');

    const documents = await this.documentRepository.find({ where: { workspaceId } });

    return [];
  }

  async getWorkspacesByUser(userId: string, options: PaginationOptions = {}): Promise<Workspace[]> {
    await this.validateAndGetUser(userId, 'User');

    const { limit = 20, offset = 0 } = options;

    const workspaces = await this.workspaceRepository.find({
      where: { ownerId: userId },
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });

    return workspaces.map((ws) => this.toGraphQLWorkspace(ws));
  }

  private toGraphQLWorkspace(entity: WorkspaceEntity): Workspace {
    return toGraphQLWorkspaceUtils(entity);
  }
}