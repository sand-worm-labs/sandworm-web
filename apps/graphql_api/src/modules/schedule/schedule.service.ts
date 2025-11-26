import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExecutionScheduleType, DocumentEntity, ExecutionScheduleEntity } from '@sandworm/postgresql-typeorm';
import { ValidationException } from '@sandworm/graphql';
import { ErrorCode } from '@/constants/error-code.constant';
import { Schedule } from './model/schedule.model';
import {
  CreateScheduleInput,
  UpdateScheduleInput,
  DeleteScheduleInput,
  ListSchedulesInput,
} from './dto/schedule.dto';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    @InjectRepository(ExecutionScheduleEntity)
    private readonly scheduleRepository: Repository<ExecutionScheduleEntity>,
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
  ) {}

  private toGraphQLSchedule(entity: ExecutionScheduleEntity): Schedule {
    return {
     ...entity
    };
  }

  async getSchedule(scheduleId: string): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new ValidationException(ErrorCode.E404, 'Schedule not found');
    }

    return this.toGraphQLSchedule(schedule);
  }

  async listSchedules(input: ListSchedulesInput): Promise<Schedule[]> {
    const { documentId } = input;

    const schedules = await this.scheduleRepository.find({
      where: { documentId },
      order: { createdAt: 'DESC' },
    });

    return schedules.map(s => this.toGraphQLSchedule(s));
  }

  async createSchedule(
    workspaceId: string,
    input: CreateScheduleInput,
  ): Promise<Schedule> {
    const { documentId, cron, timezone, isActive = true } = input;

    // Verify document exists and belongs to workspace
    const document = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId },
    });

    if (!document) {
      throw new ValidationException(ErrorCode.E003, 'Document not found');
    }

    const schedule = this.scheduleRepository.create({
      documentId,
      cron,
      timezone,
      isActive,
    });

    await this.scheduleRepository.save(schedule);

    this.logger.log(
      `Schedule created: ${schedule.id} for document ${documentId}`,
    );

    return this.toGraphQLSchedule(schedule);
  }

  async updateSchedule(
    scheduleId: string,
    input: UpdateScheduleInput,
  ): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new ValidationException(ErrorCode.E404, 'Schedule not found');
    }

    if (input.cron !== undefined) {
      schedule.cron = input.cron;
    }

    if (input.timezone !== undefined) {
      schedule.timezone = input.timezone;
    }

    if (input.isActive !== undefined) {
      schedule.isActive = input.isActive;
    }

    await this.scheduleRepository.save(schedule);

    this.logger.log(`Schedule updated: ${scheduleId}`);

    return this.toGraphQLSchedule(schedule);
  }

  async deleteSchedule(input: DeleteScheduleInput): Promise<boolean> {
    const { scheduleId, documentId, workspaceId } = input;

    // Verify schedule exists and belongs to document/workspace
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId, documentId },
      relations: ['document'],
    });

    if (!schedule) {
      throw new ValidationException(ErrorCode.E404, 'Schedule not found');
    }

    if (schedule.document.workspaceId !== workspaceId) {
      throw new ValidationException(ErrorCode.E403, 'Forbidden');
    }

    await this.scheduleRepository.delete({ id: scheduleId });

    this.logger.log(`Schedule deleted: ${scheduleId}`);

    return true;
  }

  async getSchedulesByDocument(documentId: string): Promise<Schedule[]> {
    const schedules = await this.scheduleRepository.find({
      where: { documentId },
      order: { createdAt: 'DESC' },
    });

    return schedules.map(s => this.toGraphQLSchedule(s));
  }
}