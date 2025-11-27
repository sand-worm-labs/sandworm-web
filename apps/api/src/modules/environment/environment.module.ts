import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  EnvironmentEntity,
  EnvironmentVariableEntity,
} from '@sandworm/postgresql-typeorm';
import { AuthModule } from '../graphql_auth/auth.module';
import { JupyterModule } from '../../jupyter/jupyter.module';
import { EnvironmentResolver } from './environment.resolver';
import { EnvironmentService } from './environment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EnvironmentEntity, EnvironmentVariableEntity]),
    AuthModule,
    JupyterModule,
  ],
  providers: [EnvironmentResolver, EnvironmentService],
  exports: [EnvironmentService],
})
export class EnvironmentModule {}