import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity,UserFollowsEntity,UserSettingEntity } from '@sandworm/postgresql-typeorm';
import { AuthGraphqlModule } from '../auth-graphql/auth.module';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity,UserFollowsEntity,UserSettingEntity]), AuthGraphqlModule],
  providers: [UserResolver, UserService],
})
export class UserModule { }
