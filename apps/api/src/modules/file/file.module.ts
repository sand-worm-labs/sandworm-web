import { Module } from '@nestjs/common';
import { FileResolver } from './file.resolver';
import { FileService } from './file.service';
import { AuthGraphqlModule } from '../auth-graphql/auth.module';
import { JupyterModule } from '../../jupyter/jupyter.module';

@Module({
  imports: [AuthGraphqlModule, JupyterModule],
  providers: [FileResolver, FileService],
  exports: [FileService],
})
export class FileModule {}