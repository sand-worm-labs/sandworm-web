import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  EnvironmentEntity,
  EnvironmentStatus,
  EnvironmentVariableEntity,
} from '@sandworm/postgresql-typeorm';
import { Environment } from './model/environment.model';
import { EnvironmentVariable } from './model/environment_variable.model';
import { SetEnvironmentVariablesInput } from './dto/environment.dto';
import { ValidationException } from '@sandworm/graphql';
import { ErrorCode } from '@/constants/error-code.constant';
import { JupyterService } from '@/infrastructure/jupyter/jupyter.service';
import { EventEmitter2, EventEmitterReadinessWatcher } from '@nestjs/event-emitter';
import { EnvironmentStatusEvent, EventNames } from '@/events/environment.events';

@Injectable()
export class EnvironmentService {
  private readonly logger = new Logger(EnvironmentService.name);

  constructor(
    @InjectRepository(EnvironmentEntity)
    private readonly environmentRepository: Repository<EnvironmentEntity>,
    @InjectRepository(EnvironmentVariableEntity)
    private readonly envVarRepository: Repository<EnvironmentVariableEntity>,
    private readonly jupyterService: JupyterService,
    private readonly eventEmitter: EventEmitter2,
    private readonly eventEmitterReadinessWatcher: EventEmitterReadinessWatcher,
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

      // Emit initial status
      await this.emitStatusUpdate(workspaceId, {
        status: EnvironmentStatus.STOPPED,
        startedAt: null,
      });
    }

    return Environment.fromEntity(entity);
  }

  async getEnvironmentStatus(workspaceId: string): Promise<EnvironmentStatus> {
    const environment = await this.getEnvironment(workspaceId);
    return environment.status;
  }

  async restartEnvironment(workspaceId: string): Promise<Environment> {
    this.logger.log(`Restarting environment for workspace ${workspaceId}`);

    // Update to STOPPING status
    await this.environmentRepository.update(
      { workspaceId },
      { status: EnvironmentStatus.STOPPING },
    );

    // Emit STOPPING status
    await this.emitStatusUpdate(workspaceId, {
      status: EnvironmentStatus.STOPPING,
      startedAt: null,
    });

    try {
      // Restart Jupyter
      await this.jupyterService.restart(workspaceId);

      // Update to RUNNING status
      const environment = await this.environmentRepository.findOne({
        where: { workspaceId },
      });

      if (!environment) {
        throw new ValidationException(ErrorCode.E401);
      }

      environment.status = EnvironmentStatus.RUNNING;
      environment.startedAt = new Date();
      await this.environmentRepository.save(environment);

      // Emit RUNNING status
      await this.emitStatusUpdate(workspaceId, {
        status: environment.status,
        startedAt: environment.startedAt,
      });

      this.logger.log(`Environment restarted successfully for workspace ${workspaceId}`);

      return Environment.fromEntity(environment);
    } catch (error) {
      this.logger.error(
        `Failed to restart environment for workspace ${workspaceId}`,
        error,
      );

      // Update to ERROR status
      await this.environmentRepository.update(
        { workspaceId },
        { status: EnvironmentStatus.STOPPED },
      );

      // Emit error event
      await this.emitStatusError(workspaceId, error);

      throw error;
    }
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
      `Setting environment variables for workspace ${workspaceId}: adding ${input.add.length}, removing ${input.remove.length}`,
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

    await this.jupyterService.setEnvironmentVariables(workspaceId, {
      add: input.add,
      remove: removeNames.map((v) => v.name),
    });

    const updatedVariables = await this.getEnvironmentVariables(workspaceId);

    this.logger.log(
      `Environment variables updated for workspace ${workspaceId}`,
    );

    return updatedVariables;
  }

  async deleteEnvironmentVariable(
    workspaceId: string,
    variableId: string,
  ): Promise<boolean> {
    const result = await this.envVarRepository.delete({
      id: variableId,
      workspaceId,
    });

    const success = result.affected ? result.affected > 0 : false;

    if (success) {
      this.logger.log(
        `Environment variable ${variableId} deleted for workspace ${workspaceId}`,
      );
    }

    return success;
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

  private async emitStatusUpdate(
    workspaceId: string,
    environment: { status: EnvironmentStatus; startedAt: Date | null },
  ): Promise<void> {
    await this.eventEmitterReadinessWatcher.waitUntilReady();

    this.eventEmitter.emit(
      EventNames.ENVIRONMENT_STATUS_UPDATE,
      new EnvironmentStatusEvent(
        workspaceId,
        environment.status,
        environment.startedAt?.toISOString() ?? null,
      ),
    );
  }

  private async emitStatusError(
    workspaceId: string,
    error: any,
  ): Promise<void> {
    await this.eventEmitterReadinessWatcher.waitUntilReady();

    this.eventEmitter.emit(
      EventNames.ENVIRONMENT_STATUS_ERROR,
      {
        workspaceId,
        error: error.message || String(error),
      },
    );
  }
}