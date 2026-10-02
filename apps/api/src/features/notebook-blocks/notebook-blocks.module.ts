import { Module } from '@nestjs/common';
import { DocumentModule } from '../document/document.module';
import { YjsModule } from '../collaboration/yjs/yjs.module';
import { ToolModule } from '../tool/tool.module';
import { WorkspaceModule } from '../workspace/workspace.module';
import { NotebookBlocksController } from './notebook-blocks.controller';
import { NotebookBlocksService } from './notebook-blocks.service';

@Module({
  imports: [YjsModule, DocumentModule, WorkspaceModule, ToolModule],
  controllers: [NotebookBlocksController],
  providers: [NotebookBlocksService],
})
export class NotebookBlocksModule {}
