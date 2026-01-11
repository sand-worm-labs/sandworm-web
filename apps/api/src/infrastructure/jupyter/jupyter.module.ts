import { Module, forwardRef } from '@nestjs/common';
import { JupyterService } from './jupyter.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvironmentEntity } from '@sandworm/postgresql-typeorm';
import { EnvironmentModule } from '@/features/environment/environment.module';

@Module({
  imports: [TypeOrmModule.forFeature([EnvironmentEntity]), forwardRef(() => EnvironmentModule)],
  providers: [JupyterService],
  exports: [JupyterService],
})
export class JupyterModule { }