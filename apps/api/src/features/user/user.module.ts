// user/user.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  UserEntity,
  UserSettingEntity,
  UserFollowsEntity,
  UserWorkspaceEntity,
} from '@sandworm/postgresql-typeorm';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { DocumentModule } from '../document/document.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserSettingEntity,
      UserFollowsEntity,
      UserWorkspaceEntity,
    ]),
    forwardRef(()=> DocumentModule),
  ],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule { }