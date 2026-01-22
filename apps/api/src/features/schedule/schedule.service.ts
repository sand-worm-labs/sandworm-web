import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DocumentEntity,
  ExecutionScheduleEntity,
  ExecutionScheduleType,
} from '@sandworm/postgresql-typeorm';
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
  ) { }

  async getSchedule(scheduleId: string): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new ValidationException(ErrorCode.E404, 'Schedule not found');
    }

    return Schedule.fromEntity(schedule);
  }

  async listSchedules(input: ListSchedulesInput): Promise<Schedule[]> {
    const { documentId } = input;

    const schedules = await this.scheduleRepository.find({
      where: { documentId },
      order: { createdAt: 'DESC' },
    });

    return Schedule.fromEntities(schedules);
  }

  async createSchedule(
    workspaceId: string,
    input: CreateScheduleInput,
  ): Promise<Schedule> {
    const { documentId, type, hour, minute, cron, weekdays, days, timezone, isActive = true } = input;

    // Verify document exists and belongs to workspace
    const document = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId },
    });

    if (!document) {
      throw new ValidationException(ErrorCode.E003, 'Document not found');
    }

    // Check for exact duplicate schedule
    const duplicateSchedule = await this.checkForDuplicateSchedule(
      documentId,
      type,
      { hour, minute, cron, weekdays, days },
    );

    if (duplicateSchedule) {
      throw new ValidationException(
        ErrorCode.E601,
        `An identical schedule already exists (ID: ${duplicateSchedule.id}). ` +
        `Type: ${type}, Time: ${this.getScheduleDescription(duplicateSchedule)}`,
      );
    }

    // Validate schedule type-specific fields
    this.validateScheduleInput(type, { hour, minute, cron, weekdays, days });

    const schedule = this.scheduleRepository.create({
      documentId,
      type,
      hour,
      minute,
      cron,
      weekdays,
      days,
      timezone,
      isActive,
    });

    await this.scheduleRepository.save(schedule);

    this.logger.log(
      `Schedule created: ${schedule.id} (type: ${type}) for document ${documentId}`,
    );

    return Schedule.fromEntity(schedule);
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

    // Validate if type is being changed
    const newType = input.type ?? schedule.type;
    this.validateScheduleInput(newType, {
      hour: input.hour ?? schedule.hour,
      minute: input.minute ?? schedule.minute,
      cron: input.cron ?? schedule.cron,
      weekdays: input.weekdays ?? schedule.weekdays,
      days: input.days ?? schedule.days,
    });

    // Update fields
    if (input.type !== undefined) {
      schedule.type = input.type;
    }

    if (input.hour !== undefined) {
      schedule.hour = input.hour;
    }

    if (input.minute !== undefined) {
      schedule.minute = input.minute;
    }

    if (input.cron !== undefined) {
      schedule.cron = input.cron;
    }

    if (input.weekdays !== undefined) {
      schedule.weekdays = input.weekdays;
    }

    if (input.days !== undefined) {
      schedule.days = input.days;
    }

    if (input.timezone !== undefined) {
      schedule.timezone = input.timezone;
    }

    if (input.isActive !== undefined) {
      schedule.isActive = input.isActive;
    }

    await this.scheduleRepository.save(schedule);

    this.logger.log(`Schedule updated: ${scheduleId}`);

    return Schedule.fromEntity(schedule);
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

    return Schedule.fromEntities(schedules);
  }

  /**
   * Check if an identical schedule already exists
   * Compares type and relevant time fields based on schedule type
   */
  private async checkForDuplicateSchedule(
    documentId: string,
    type: ExecutionScheduleType,
    fields: {
      hour?: number;
      minute?: number;
      cron?: string;
      weekdays?: string;
      days?: string;
    },
  ): Promise<ExecutionScheduleEntity | null> {
    const whereClause: any = {
      documentId,
      type,
    };

    // Add type-specific fields to check for duplicates
    switch (type) {
      case ExecutionScheduleType.HOURLY:
        whereClause.minute = fields.minute;
        break;

      case ExecutionScheduleType.DAILY:
        whereClause.hour = fields.hour;
        whereClause.minute = fields.minute;
        break;

      case ExecutionScheduleType.WEEKLY:
        whereClause.hour = fields.hour;
        whereClause.minute = fields.minute;
        whereClause.weekdays = fields.weekdays;
        break;

      case ExecutionScheduleType.MONTHLY:
        whereClause.hour = fields.hour;
        whereClause.minute = fields.minute;
        whereClause.days = fields.days;
        break;

      case ExecutionScheduleType.CRON:
        whereClause.cron = fields.cron;
        break;
    }

    return await this.scheduleRepository.findOne({ where: whereClause });
  }

  /**
   * Get human-readable description of schedule for error messages
   */
  private getScheduleDescription(schedule: ExecutionScheduleEntity): string {
    switch (schedule.type) {
      case ExecutionScheduleType.HOURLY:
        return `Every hour at :${schedule.minute}`;

      case ExecutionScheduleType.DAILY:
        return `Daily at ${schedule.hour}:${String(schedule.minute).padStart(2, '0')}`;

      case ExecutionScheduleType.WEEKLY:
        return `Weekly on days ${schedule.weekdays} at ${schedule.hour}:${String(schedule.minute).padStart(2, '0')}`;

      case ExecutionScheduleType.MONTHLY:
        return `Monthly on days ${schedule.days} at ${schedule.hour}:${String(schedule.minute).padStart(2, '0')}`;

      case ExecutionScheduleType.CRON:
        return `Cron: ${schedule.cron}`;

      default:
        return 'Unknown';
    }
  }

  private validateScheduleInput(
    type: ExecutionScheduleType,
    fields: {
      hour?: number;
      minute?: number;
      cron?: string;
      weekdays?: string;
      days?: string;
    },
  ): void {
    switch (type) {
      case ExecutionScheduleType.HOURLY:
        if (fields.minute === undefined) {
          throw new ValidationException(
            ErrorCode.E600,
            'Minute is required for HOURLY schedule',
          );
        }
        break;

      case ExecutionScheduleType.DAILY:
        if (fields.hour === undefined || fields.minute === undefined) {
          throw new ValidationException(
            ErrorCode.E600,
            'Hour and minute are required for DAILY schedule',
          );
        }
        break;

      case ExecutionScheduleType.WEEKLY:
        if (
          fields.hour === undefined ||
          fields.minute === undefined ||
          !fields.weekdays
        ) {
          throw new ValidationException(
            ErrorCode.E600,
            'Hour, minute, and weekdays are required for WEEKLY schedule',
          );
        }
        // Validate weekdays format (comma-separated numbers 0-6)
        const weekdaysArray = fields.weekdays.split(',').map(Number);
        if (weekdaysArray.some((day) => isNaN(day) || day < 0 || day > 6)) {
          throw new ValidationException(
            ErrorCode.E600,
            'Weekdays must be comma-separated numbers between 0-6',
          );
        }
        break;

      case ExecutionScheduleType.MONTHLY:
        if (
          fields.hour === undefined ||
          fields.minute === undefined ||
          !fields.days
        ) {
          throw new ValidationException(
            ErrorCode.E600,
            'Hour, minute, and days are required for MONTHLY schedule',
          );
        }
        // Validate days format (comma-separated numbers 0-30)
        const daysArray = fields.days.split(',').map(Number);
        if (daysArray.some((day) => isNaN(day) || day < 0 || day > 30)) {
          throw new ValidationException(
            ErrorCode.E600,
            'Days must be comma-separated numbers between 0-30',
          );
        }
        break;

      case ExecutionScheduleType.CRON:
        if (!fields.cron) {
          throw new ValidationException(
            ErrorCode.E600,
            'Cron expression is required for CRON schedule',
          );
        }
        // Basic cron validation (6 parts for cron with seconds)
        const cronParts = fields.cron.trim().split(/\s+/);
        if (cronParts.length !== 6) {
          throw new ValidationException(
            ErrorCode.E600,
            'Cron expression must have 6 parts (second minute hour day month weekday)',
          );
        }
        break;

      default:
        throw new ValidationException(
          ErrorCode.E600,
          `Unknown schedule type: ${type}`,
        );
    }
  }
}