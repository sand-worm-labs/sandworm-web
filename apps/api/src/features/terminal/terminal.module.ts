import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  TerminalClientEntity,
  TerminalInviteEntity,
  TerminalMemberEntity,
  UserEntity,
} from '@sandworm/postgresql-typeorm';
import { StaffModule } from '../staff/staff.module';
import { TerminalResolver } from './terminal.resolver';
import { TerminalService } from './terminal.service';
import { TerminalTeamService } from './terminal-team.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TerminalClientEntity,
      TerminalInviteEntity,
      TerminalMemberEntity,
      UserEntity,
    ]),
    StaffModule,
  ],
  providers: [TerminalResolver, TerminalService, TerminalTeamService],
})
export class TerminalModule {}
