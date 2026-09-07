import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutionScheduleEntity, DocumentEntity, YjsAppDocumentEntity } from '@sandworm/postgresql-typeorm';
import { ScheduleResolver } from './schedule.resolver';
import { ScheduleService } from './schedule.service';
import { ScheduleExecutorService } from './schedule-executor.service';
import { AuthGraphqlModule } from '../auth/graphql/auth-graphql.module';
import { YjsModule } from '../collaboration/yjs/yjs.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([ExecutionScheduleEntity, DocumentEntity, YjsAppDocumentEntity]),
    AuthGraphqlModule,
    YjsModule,
  ],
  providers: [ScheduleResolver, ScheduleService, ScheduleExecutorService],
  exports: [ScheduleService],
})
export class ScheduleModule { }