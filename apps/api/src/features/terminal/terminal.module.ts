import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DocumentEntity,
  TerminalAnalysisSubjectEntity,
  TerminalBriefingItemEntity,
  TerminalBriefingReadEntity,
  TerminalClientEntity,
  TerminalMemberEntity,
  TerminalRequestEntity,
  TerminalSignalEntity,
  UserEntity,
} from '@sandworm/postgresql-typeorm';
import { TerminalContentResolver } from './terminal-content.resolver';
import { TerminalContentService } from './terminal-content.service';
import { TerminalResolver } from './terminal.resolver';
import { TerminalService } from './terminal.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentEntity,
      TerminalAnalysisSubjectEntity,
      TerminalBriefingItemEntity,
      TerminalBriefingReadEntity,
      TerminalClientEntity,
      TerminalMemberEntity,
      TerminalRequestEntity,
      TerminalSignalEntity,
      UserEntity,
    ]),
  ],
  providers: [TerminalResolver, TerminalService, TerminalContentResolver, TerminalContentService],
})
export class TerminalModule {}
