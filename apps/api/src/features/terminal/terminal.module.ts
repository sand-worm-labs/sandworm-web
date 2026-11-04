import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  TerminalClientEntity,
  TerminalMemberEntity,
  UserEntity,
} from '@sandworm/postgresql-typeorm';
import { TerminalResolver } from './terminal.resolver';
import { TerminalService } from './terminal.service';

@Module({
  imports: [TypeOrmModule.forFeature([
      TerminalClientEntity,
      TerminalMemberEntity,
      UserEntity,
    ]),],
  providers: [TerminalResolver, TerminalService],
})
export class TerminalModule {}
