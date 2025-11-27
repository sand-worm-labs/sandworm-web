// apps/graphql_api/src/modules/schedule/schedule.resolver.ts
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';
import { ScheduleService } from './schedule.service';
import { Schedule } from './model/schedule.model';
import {
  CreateScheduleInput,
  UpdateScheduleInput,
  DeleteScheduleInput,
  ListSchedulesInput,
} from './dto/schedule.dto';

@Resolver(() => Schedule)
export class ScheduleResolver {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Query(() => Schedule, {
    name: 'schedule',
    description: 'Get a single schedule by ID',
  })
  async getSchedule(
    @Args('scheduleId') scheduleId: string,
  ): Promise<Schedule> {
    return this.scheduleService.getSchedule(scheduleId);
  }

  @Query(() => [Schedule], {
    name: 'schedules',
    description: 'Get all schedules for a document',
  })
  async listSchedules(
    @Args('input') input: ListSchedulesInput,
  ): Promise<Schedule[]> {
    return this.scheduleService.listSchedules(input);
  }

  @Mutation(() => Schedule, {
    name: 'createSchedule',
    description: 'Create a new execution schedule for a document',
  })
  async createSchedule(
    @Args('workspaceId') workspaceId: string,
    @Args('input') input: CreateScheduleInput,
    @CurrentUser('id') userId: string,
  ): Promise<Schedule> {
    return this.scheduleService.createSchedule(workspaceId, input);
  }

  @Mutation(() => Schedule, {
    name: 'updateSchedule',
    description: 'Update an existing schedule',
  })
  async updateSchedule(
    @Args('scheduleId') scheduleId: string,
    @Args('input') input: UpdateScheduleInput,
  ): Promise<Schedule> {
    return this.scheduleService.updateSchedule(scheduleId, input);
  }

  @Mutation(() => Boolean, {
    name: 'deleteSchedule',
    description: 'Delete a schedule',
  })
  async deleteSchedule(
    @Args('input') input: DeleteScheduleInput,
    @CurrentUser('id') userId: string,
  ): Promise<boolean> {
    return this.scheduleService.deleteSchedule(input);
  }
}