import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { EnvironmentService } from './environment.service';
import { Environment} from './model/environment.model';
import {EnvironmentVariable} from './model/environment_variable.model';
import {
  SetEnvironmentVariablesInput,
  RestartEnvironmentInput,
} from './dto/environment.dto';
import { EnvironmentStatus } from '@sandworm/postgresql-typeorm';
import GraphQLJSON from 'graphql-type-json';
import { SysinfoService } from './sys.service';

@Resolver(() => Environment)
export class EnvironmentResolver {
  constructor(private readonly environmentService: EnvironmentService, private readonly sysinfoService: SysinfoService) {}

  @Query(() => Environment, {
    name: 'environment',
    description: 'Get environment details for a workspace',
  })
  async getEnvironment(
    @Args('workspaceId') workspaceId: string,
  ): Promise<Environment> {
    return this.environmentService.getEnvironment(workspaceId);
  }

  @Query(() => EnvironmentStatus, {
    name: 'environmentStatus',
    description: 'Get current environment status',
  })
  async getEnvironmentStatus(
    @Args('workspaceId') workspaceId: string,
  ): Promise<EnvironmentStatus> {
    return this.environmentService.getEnvironmentStatus(workspaceId);
  }

  @Query(() => [EnvironmentVariable], {
    name: 'environmentVariables',
    description: 'Get all environment variables (values are masked)',
  })
  async getEnvironmentVariables(
    @Args('workspaceId') workspaceId: string,
  ): Promise<EnvironmentVariable[]> {
    return this.environmentService.getEnvironmentVariables(workspaceId);
  }

  @Query(() => GraphQLJSON, {
    name: 'currentSysInfo',
    description: 'Get current system info',
  })
  async currentSysInfo(
      @Args('workspaceId') workspaceId: string,
      @Args('sessionId') sessionId: string,
  ): Promise<Record<string, any>> {
      return this.sysinfoService.collect({ workspaceId, sessionId });
  }

  @Mutation(() => Environment, {
    name: 'restartEnvironment',
    description: 'Restart the Jupyter environment',
  })
  async restartEnvironment(
    @Args('input') input: RestartEnvironmentInput,
  ): Promise<Environment> {
    const environment = await this.environmentService.restartEnvironment(
      input.workspaceId,
    );
    return environment;
  }

  @Mutation(() => [EnvironmentVariable], {
    name: 'setEnvironmentVariables',
    description: 'Add or remove environment variables',
  })
  async setEnvironmentVariables(
    @Args('workspaceId') workspaceId: string,
    @Args('input') input: SetEnvironmentVariablesInput,
  ): Promise<EnvironmentVariable[]> {
    const variables = await this.environmentService.setEnvironmentVariables(
      workspaceId,
      input,
    );

    return variables;
  }

  @Mutation(() => Boolean, {
    name: 'deleteEnvironmentVariable',
    description: 'Delete a single environment variable',
  })
  async deleteEnvironmentVariable(
    @Args('workspaceId') workspaceId: string,
    @Args('variableId') variableId: string,
  ): Promise<boolean> {
    return this.environmentService.deleteEnvironmentVariable(
      workspaceId,
      variableId,
    );
  }

}