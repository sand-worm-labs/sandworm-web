import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  EnvironmentEntity,
  EnvironmentVariableEntity,
} from '@sandworm/postgresql-typeorm';
import { AuthGraphqlModule } from '../auth-graphql/auth.module';
import { JupyterModule } from '../../jupyter/jupyter.module';
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
export class EnvironmentModule {}