import { Module } from '@nestjs/common';
import { DocumentModule } from '../document/document.module';
import { YjsModule } from '../collaboration/yjs/yjs.module';
import { ToolModule } from '../tool/tool.module';
import { WorkspaceModule } from '../workspace/workspace.module';
import { NotebookBlocksController } from './notebook-blocks.controller';
import { NotebookBlocksService } from './notebook-blocks.service';
import { NotebookDashboardController } from './notebook-dashboard.controller';
import { NotebookDashboardService } from './notebook-dashboard.service';
import { NotebookDocService } from './notebook-doc.service';
import { NotebookRunController, NotebookViewController } from './notebook-run.controller';
import { NotebookRunService } from './notebook-run.service';

@Module({
  imports: [YjsModule, DocumentModule, WorkspaceModule, ToolModule],
  controllers: [NotebookBlocksController, NotebookDashboardController, NotebookRunController, NotebookViewController],
  providers: [NotebookDocService, NotebookBlocksService, NotebookDashboardService, NotebookRunService],
})
export class NotebookBlocksModule {}
