import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DocumentEntity,
  ExecutionScheduleEntity,
  TerminalAnalysisSubjectEntity,
  TerminalBriefingItemEntity,
  TerminalBriefingReadEntity,
  TerminalClientEntity,
  TerminalInviteEntity,
  TerminalKpiEntity,
  TerminalKpiValueEntity,
  TerminalMemberEntity,
  TerminalRequestEntity,
  TerminalSignalEntity,
  UserEntity,
} from '@sandworm/postgresql-typeorm';
import { NotebookBlocksModule } from '../notebook-blocks/notebook-blocks.module';
import { StaffModule } from '../staff/staff.module';
import { TerminalContentResolver } from './terminal-content.resolver';
import { TerminalContentService } from './terminal-content.service';
import { TerminalKpiResolver } from './terminal-kpi.resolver';
import { TerminalKpiService } from './terminal-kpi.service';
import { TerminalResolver } from './terminal.resolver';
import { TerminalService } from './terminal.service';
import { TerminalTeamService } from './terminal-team.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentEntity,
      ExecutionScheduleEntity,
      TerminalAnalysisSubjectEntity,
      TerminalBriefingItemEntity,
      TerminalBriefingReadEntity,
      TerminalClientEntity,
      TerminalInviteEntity,
      TerminalKpiEntity,
      TerminalKpiValueEntity,
      TerminalMemberEntity,
      TerminalRequestEntity,
      TerminalSignalEntity,
      UserEntity,
    ]),
    StaffModule,
    NotebookBlocksModule,
  ],
  providers: [
    TerminalResolver,
    TerminalService,
    TerminalTeamService,
    TerminalContentResolver,
    TerminalContentService,
    TerminalKpiResolver,
    TerminalKpiService,
  ],
})
export class TerminalModule {}
