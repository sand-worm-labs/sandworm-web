import { forwardRef, Module } from '@nestjs/common';
import { WorkspaceModule } from '../workspace/workspace.module';
import { StaffService } from './staff.service';

@Module({
  imports: [forwardRef(() => WorkspaceModule)],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
