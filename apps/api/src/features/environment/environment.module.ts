import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  EnvironmentEntity,
  EnvironmentVariableEntity,
} from '@sandworm/postgresql-typeorm';
import { AuthGraphqlModule } from '@/features/auth/graphql/auth-graphql.module';
import { JupyterModule } from '@/infrastructure/jupyter/jupyter.module';
import { EnvironmentResolver } from './environment.resolver';
import { EnvironmentService } from './environment.service';
import { CodeExecutionModule } from '../code-execution/code-execution.module';
import { SysinfoService } from './sys.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EnvironmentEntity, EnvironmentVariableEntity]),
    AuthGraphqlModule,
    forwardRef(() => JupyterModule),
    CodeExecutionModule
  ],
  providers: [EnvironmentResolver, EnvironmentService, SysinfoService],
  exports: [EnvironmentService],
})
export class EnvironmentModule { }