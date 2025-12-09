import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity,UserFollowsEntity,UserSettingEntity } from '@sandworm/postgresql-typeorm';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity,UserFollowsEntity,UserSettingEntity])],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule { }
