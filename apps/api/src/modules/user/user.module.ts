// user/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  UserEntity,
  UserSettingEntity,
  UserFollowsEntity,
  UserWorkspaceEntity,
} from '@sandworm/postgresql-typeorm';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserSettingEntity,
      UserFollowsEntity,
      UserWorkspaceEntity,
    ]),
  ],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule { }