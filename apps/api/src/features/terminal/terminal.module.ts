import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DocumentEntity,
  TerminalAnalysisSubjectEntity,
  TerminalBriefingItemEntity,
  TerminalBriefingReadEntity,
  TerminalClientEntity,
  TerminalInviteEntity,
  TerminalMemberEntity,
  TerminalRequestEntity,
  TerminalSignalEntity,
  UserEntity,
} from '@sandworm/postgresql-typeorm';
import { StaffModule } from '../staff/staff.module';
import { TerminalContentResolver } from './terminal-content.resolver';
import { TerminalContentService } from './terminal-content.service';
import { TerminalResolver } from './terminal.resolver';
import { TerminalService } from './terminal.service';
import { TerminalTeamService } from './terminal-team.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentEntity,
      TerminalAnalysisSubjectEntity,
      TerminalBriefingItemEntity,
      TerminalBriefingReadEntity,
      TerminalClientEntity,
      TerminalInviteEntity,
      TerminalMemberEntity,
      TerminalRequestEntity,
      TerminalSignalEntity,
      UserEntity,
    ]),
    StaffModule,
  ],
  providers: [
    TerminalResolver,
    TerminalService,
    TerminalTeamService,
    TerminalContentResolver,
    TerminalContentService,
  ],
})
export class TerminalModule {}
