import { Module } from '@nestjs/common';
import { FileResolver } from './file.resolver';
import { FileService } from './file.service';
import { AuthModule } from '../auth-graphql/auth.module';
import { JupyterModule } from '../../jupyter/jupyter.module';

@Module({
  imports: [AuthModule, JupyterModule],
  providers: [FileResolver, FileService],
  exports: [FileService],
})
export class FileModule {}