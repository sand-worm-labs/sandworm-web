import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { WorkspaceEntity, UserEntity, DocumentEntity } from '@sandworm/postgresql-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Workspace } from './model/workspace.model';
import { User } from '../user/model/graphql/user.model';
import { Document } from '../document/model/document.model';
import { toGraphQLWorkspaceUtils } from '@/utils/models';

interface PaginationOptions {
  limit?: number;
  offset?: number;
}

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
  ) {}

  async getWorkspaceById(workspaceId: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({ where: { id: workspaceId } });
    if (!workspace) throw new NotFoundException('Workspace not found');
    return this.toGraphQLWorkspace(workspace);
  }

  async getAllUserWorkspaces( userId: string, options: PaginationOptions): Promise<Workspace[]> {
    const { limit = 20, offset = 0 } = options;
    const workspaces = await this.workspaceRepository.find({
      where: { ownerId: userId },
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });
    if (!workspaces.length) throw new NotFoundException('Workspace not found');
    return workspaces.map((ws) => this.toGraphQLWorkspace(ws));
  }

  async createWorkspace(data: { ownerId: string; name: string }): Promise<Workspace> {
    const owner = await this.userRepository.findOne({ where: { id: data.ownerId } });
    if (!owner) throw new NotFoundException('Owner not found');

    const workspace = this.workspaceRepository.create({
      name: data.name,
      ownerId: data.ownerId,
    });

    const savedWorkspace = await this.workspaceRepository.save(workspace);
    return this.toGraphQLWorkspace(savedWorkspace);
  }

  async updateWorkspace(workspaceId: string, data: { name?: string }): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({ where: { id: workspaceId } });
    if (!workspace) throw new NotFoundException('Workspace not found');

    Object.assign(workspace, data);
    const updatedWorkspace = await this.workspaceRepository.save(workspace);
    return this.toGraphQLWorkspace(updatedWorkspace);
  }

  async getWorkspaceOwner(ownerId: string): Promise<User> {
    const owner = await this.userRepository.findOne({ where: { id: ownerId } });
    if (!owner) throw new NotFoundException('Owner not found');
    return User.fromEntity(owner);
  }

  async getWorkspaceDocuments(workspaceId: string): Promise<Document[]> {
    let documents = await this.documentRepository.find({ where: { workspaceId } });
    return [];
  }

  async getWorkspacesByUser(userId: string, options: PaginationOptions = {}): Promise<Workspace[]> {
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
