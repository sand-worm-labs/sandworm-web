import { Module, forwardRef } from '@nestjs/common';
import { JupyterService } from './jupyter.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvironmentEntity } from '@sandworm/postgresql-typeorm';
import { EnvironmentModule } from '@/features/environment/environment.module';
import { LockModule } from '../lock/lock.module';

@Module({
  imports: [TypeOrmModule.forFeature([EnvironmentEntity]), forwardRef(() => EnvironmentModule), LockModule],
  providers: [JupyterService],
  exports: [JupyterService],
})
export class JupyterModule { }