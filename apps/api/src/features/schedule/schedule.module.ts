import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutionScheduleEntity, DocumentEntity } from '@sandworm/postgresql-typeorm';
import { ScheduleResolver } from './schedule.resolver';
import { ScheduleService } from './schedule.service';
import { AuthGraphqlModule } from '../auth/graphql/auth-graphql.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([ExecutionScheduleEntity, DocumentEntity]),
    AuthGraphqlModule,
  ],
  providers: [ScheduleResolver, ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule { }