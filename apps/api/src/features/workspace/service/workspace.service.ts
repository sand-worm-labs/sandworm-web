import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { In, Repository } from 'typeorm';
import {
  WorkspaceEntity,
  UserWorkspaceEntity,
  UserEntity,
  DocumentEntity,
  UserWorkspaceRole,
  UserWorkspaceStatus,
} from '@sandworm/postgresql-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Workspace } from '../model/workspace.model';
import { User } from '../../user/model/graphql/user.model';
import { Document } from '../../document/model/document.model';
import {
  validateUUID,
  validateNonEmptyString,
  validateStringLength,
} from '@/common/utils/uuid';
import { WorkspaceInfo } from '../model/workspace-info.model';
import { getRandomIconColor } from '@/common/utils/color';
import { EnvironmentService } from '@/features/environment/environment.service';
import { OpenRouterService } from '@/infrastructure/openrouter/openrouter.service';
import { AI_ENV_KEYS, AIProvider } from '@/core/constants/app.constant';

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
    private readonly environmentService: EnvironmentService,
    private readonly openRouterService: OpenRouterService, 
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

    const color = getRandomIconColor();

    const workspace = this.workspaceRepository.create({
      icon: color,
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
    await this.environmentService.getEnvironment(savedWorkspace.id);
    await this.setupAIKey(savedWorkspace.id, AIProvider.OPENROUTER);
 
    return Workspace.fromEntity(savedWorkspace);
  }
 
  async setupAIKey(workspaceId: string, provider: AIProvider) {
    const envKey = AI_ENV_KEYS[provider];

    const key = await this.openRouterService.provisionKey(workspaceId);

    await this.environmentService.setEnvironmentVariables(workspaceId, {
      add: [{ name: envKey, value: key.data.hash }],
      remove: [],
    });
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
    data: { name?: string; ownerId?: string, icon?: string },
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
      where: { id: workspaceId, ownerId: data.ownerId, icon: data.icon },
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

  async getWorkspaceDefaultAiModel(workspaceId: string, userId: string): Promise<string> {
    await this.validateAndGetUser(userId, 'User');
    const membership = await this.workspaceMembersRepository.findOne({
      where: { workspaceId, userId, status: UserWorkspaceStatus.ACTIVE },
    });

    if (!membership) {
      throw new BadRequestException(
        'You must be a member of this workspace',
      );
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });
  
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    return workspace.assistantModel
  }

  async setWorkspaceDefaultAiModel(workspaceId: string,userId: string, model: string): Promise<void> {  
    validateUUID(workspaceId, 'Workspace ID');
    validateUUID(userId, 'User ID');
    validateNonEmptyString(model, 'Model');

    const membership = await this.workspaceMembersRepository.findOne({
      where: { workspaceId, userId, status: UserWorkspaceStatus.ACTIVE },
    });

    if (!membership) {
      throw new BadRequestException(
        'You must be a member of this workspace',
      );
    }

    if (membership.role !== UserWorkspaceRole.ADMIN) {
      throw new BadRequestException(
        'Only admins can change the default AI model',
      );
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    workspace.assistantModel = model.trim();

    await this.workspaceRepository.save(workspace);
  }

  async hasModelAiKey(workspaceId: string): Promise<boolean> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });
  
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    let foundKey = await this.environmentService.getEnvironmentVariable(workspace.id, AIProvider.OPENROUTER)
    if(process.env.NODE_ENV === 'development') {
       await this.setupAIKey(workspace.id, AIProvider.OPENROUTER)
       return true
    }

    return !!foundKey
  }

  async getWorkspaceAiHash(workspaceId: string): Promise<string | null> {
    validateUUID(workspaceId, 'Workspace ID');

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const envKey = AI_ENV_KEYS[AIProvider.OPENROUTER];
    const aiEnvKey =  await this.environmentService.getEnvironmentVariable(workspaceId, envKey);
    return aiEnvKey.value || null
  }
}