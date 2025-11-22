import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EnvironmentEntity,
  EnvironmentVariableEntity,
} from '@sandworm/postgresql-typeorm';
import { JupyterService } from '../../jupyter/jupyter.service';
import {
  Environment,
  EnvironmentVariable,
  EnvironmentStatus,
} from './model/environment.model';
import { SetEnvironmentVariablesInput } from './dto/environment.dto';

@Injectable()
export class EnvironmentService {
  private readonly logger = new Logger(EnvironmentService.name);

  constructor(
    @InjectRepository(EnvironmentEntity)
    private readonly environmentRepository: Repository<EnvironmentEntity>,
    @InjectRepository(EnvironmentVariableEntity)
    private readonly envVarRepository: Repository<EnvironmentVariableEntity>,
    private readonly jupyterService: JupyterService,
  ) {}

  private toGraphQLEnvironment(entity: EnvironmentEntity): Environment {
    return {
      id: entity.id,
      workspaceId: entity.workspaceId,
      status: entity.status as EnvironmentStatus,
      lastActivityAt: entity.lastActivityAt,
      resourceVersion: entity.resourceVersion,
    };
  }

  private toGraphQLEnvironmentVariable(
    entity: EnvironmentVariableEntity,
  ): EnvironmentVariable {
    return {
     ...entity
    };
  }

  async getEnvironment(workspaceId: string): Promise<Environment> {
    let entity = await this.environmentRepository.findOne({
      where: { workspaceId },
    });

    if (!entity) {
      // Create environment if it doesn't exist
      entity = this.environmentRepository.create({
        workspaceId,
        status: EnvironmentStatus.STOPPED,
        resourceVersion: 0,
      });
      await this.environmentRepository.save(entity);
    }

    return this.toGraphQLEnvironment(entity);
  }

  async getEnvironmentStatus(workspaceId: string): Promise<EnvironmentStatus> {
    const environment = await this.getEnvironment(workspaceId);
    return environment.status;
  }

  async restartEnvironment(workspaceId: string): Promise<Environment> {
    this.logger.log(`Restarting environment for workspace ${workspaceId}`);

    // Update status to stopping
    await this.environmentRepository.update(
      { workspaceId },
      { status: EnvironmentStatus.STOPPING },
    );

    await this.jupyterService.restart(workspaceId);

    const entity = await this.environmentRepository.findOne({
      where: { workspaceId },
    });

    if (!entity) {
      throw new NotFoundException('Environment not found');
    }

    entity.status = EnvironmentStatus.RUNNING;
    entity.startedAt = new Date();
    await this.environmentRepository.save(entity);

    return this.toGraphQLEnvironment(entity);
  }

  async getEnvironmentVariables(
    workspaceId: string,
  ): Promise<EnvironmentVariable[]> {
    const entities = await this.envVarRepository.find({
      where: { workspaceId },
      order: { name: 'ASC' },
    });

    return entities.map(entity => this.toGraphQLEnvironmentVariable(entity));
  }

  async setEnvironmentVariables(
    workspaceId: string,
    input: SetEnvironmentVariablesInput,
  ): Promise<EnvironmentVariable[]> {
    this.logger.log(
      `Setting environment variables for workspace ${workspaceId}`,
    );

  
    if (input.remove.length > 0) {
      await this.envVarRepository.delete({
        id: { $in: input.remove } as any,
        workspaceId,
      });
    }

   
    if (input.add.length > 0) {
      const newVars = input.add.map(v =>
        this.envVarRepository.create({
          name: v.name,
          value: v.value, 
          workspaceId,
        }),
      );
      await this.envVarRepository.save(newVars);
    }

    const removeNames = await this.envVarRepository.find({
      where: { id: { $in: input.remove } as any },
      select: ['name'],
    });

    await this.jupyterService.setEnvironmentVariables(workspaceId, {
      add: input.add,
      remove: removeNames.map(v => v.name),
    });

    // Return updated list
    return this.getEnvironmentVariables(workspaceId);
  }

  async deleteEnvironmentVariable(
    workspaceId: string,
    variableId: string,
  ): Promise<boolean> {
    const result = await this.envVarRepository.delete({
      id: variableId,
      workspaceId,
    });

    return result.affected ? result.affected > 0 : false;
  }
}