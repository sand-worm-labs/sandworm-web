import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  EnvironmentEntity,
  EnvironmentVariableEntity,
} from '@sandworm/postgresql-typeorm';
import { AuthGraphqlModule } from '@/features/auth/graphql/auth-graphql.module';
import { JupyterModule } from '@/infrastructure/jupyter/jupyter.module';
import { EnvironmentResolver } from './environment.resolver';
import { EnvironmentService } from './environment.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([EnvironmentEntity, EnvironmentVariableEntity]),
    AuthGraphqlModule,
    JupyterModule,
  ],
  providers: [EnvironmentResolver, EnvironmentService],
  exports: [EnvironmentService],
})
export class EnvironmentModule { }