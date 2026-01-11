import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  EnvironmentEntity,
  EnvironmentStatus,
  EnvironmentVariableEntity,
} from '@sandworm/postgresql-typeorm';;
import { Environment } from './model/environment.model';
import { EnvironmentVariable } from './model/environment_variable.model';
import { SetEnvironmentVariablesInput } from './dto/environment.dto';
import { ValidationException } from '@sandworm/graphql';
import { ErrorCode } from '@/constants/error-code.constant';
import { JupyterService } from '@/infrastructure/jupyter/jupyter.service';

@Injectable()
export class EnvironmentService {
  private readonly logger = new Logger(EnvironmentService.name);

  constructor(
    @InjectRepository(EnvironmentEntity)
    private readonly environmentRepository: Repository<EnvironmentEntity>,
    @InjectRepository(EnvironmentVariableEntity)
    private readonly envVarRepository: Repository<EnvironmentVariableEntity>,
    private readonly jupyterService: JupyterService,
  ) { }

  async getEnvironment(workspaceId: string): Promise<Environment> {
    let entity = await this.environmentRepository.findOne({
      where: { workspaceId },
    });

    if (!entity) {
      entity = this.environmentRepository.create({
        workspaceId,
        status: EnvironmentStatus.STOPPED,
        resourceVersion: 0,
      });
      await this.environmentRepository.save(entity);
    }

    return Environment.fromEntity(entity);
  }

  async getEnvironmentStatus(workspaceId: string): Promise<EnvironmentStatus> {
    const environment = await this.getEnvironment(workspaceId);
    return environment.status;
  }

  async restartEnvironment(workspaceId: string): Promise<Environment> {
    this.logger.log(`Restarting environment for workspace ${workspaceId}`);

    await this.environmentRepository.update(
      { workspaceId },
      { status: EnvironmentStatus.STOPPING },
    );

    await this.jupyterService.restart();

    const environment = await this.environmentRepository.findOne({
      where: { workspaceId },
    });

    if (!environment) {
      throw new ValidationException(ErrorCode.E401);
    }

    environment.status = EnvironmentStatus.RUNNING;
    environment.startedAt = new Date();
    await this.environmentRepository.save(environment);

    return Environment.fromEntity(environment);
  }

  async getEnvironmentVariables(
    workspaceId: string,
  ): Promise<EnvironmentVariable[]> {
    const entities = await this.envVarRepository.find({
      where: { workspaceId },
      order: { name: 'ASC' },
    });

    return EnvironmentVariable.fromEntities(entities);
  }

  async setEnvironmentVariables(
    workspaceId: string,
    input: SetEnvironmentVariablesInput,
  ): Promise<EnvironmentVariable[]> {
    this.logger.log(
      `Setting environment variables for workspace ${workspaceId}`,
    );

    const removeNames =
      input.remove.length > 0
        ? await this.envVarRepository.find({
          where: { id: In(input.remove), workspaceId },
          select: ['name'],
        })
        : [];

    if (input.remove.length > 0) {
      await this.envVarRepository.delete({
        id: In(input.remove),
        workspaceId,
      });
    }

    if (input.add.length > 0) {
      const newVars = input.add.map((v) =>
        this.envVarRepository.create({
          name: v.name,
          value: v.value,
          workspaceId,
        }),
      );
      await this.envVarRepository.save(newVars);
    }

    await this.jupyterService.setEnvironmentVariables({
      add: input.add,
      remove: removeNames.map((v) => v.name),
    });

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

  async registerLastActivity(
    workspaceId: string,
    lastActivityAt: Date,
  ): Promise<Environment> {
    this.logger.debug(
      `Registering last activity for workspace ${workspaceId} at ${lastActivityAt.toISOString()}`,
    );

    const result = await this.environmentRepository.update(
      { workspaceId },
      { lastActivityAt },
    );

    if (!result.affected || result.affected === 0) {
      throw new NotFoundException(
        `Environment not found for workspace ${workspaceId}`,
      );
    }

    const environment = await this.environmentRepository.findOne({
      where: { workspaceId },
    });

    if (!environment) {
      throw new NotFoundException(
        `Environment not found for workspace ${workspaceId}`,
      );
    }

    return Environment.fromEntity(environment);
  }
}