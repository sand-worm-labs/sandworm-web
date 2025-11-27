// apps/graphql_api/src/modules/schedule/schedule.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutionScheduleEntity, DocumentEntity } from '@sandworm/postgresql-typeorm';
import { AuthModule } from '../auth-graphql/auth.module';
import { ScheduleResolver } from './schedule.resolver';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExecutionScheduleEntity, DocumentEntity]),
    AuthModule,
  ],
  providers: [ScheduleResolver, ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}