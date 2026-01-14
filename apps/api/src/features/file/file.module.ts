import { Module } from '@nestjs/common';
import { FileResolver } from './file.resolver';
import { FileService } from './file.service';
import { AuthGraphqlModule } from '../auth/graphql/auth-graphql.module';
import { JupyterModule } from '@/infrastructure/jupyter/jupyter.module';
import { FileController } from './file.controller';

@Module({
  imports: [AuthGraphqlModule, JupyterModule],
  controllers: [FileController],
  providers: [FileResolver, FileService],
  exports: [FileService],
})
export class FileModule { }