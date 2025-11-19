import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity,UserFollowsEntity,UserSettingEntity } from '@sandworm/postgresql-typeorm';
import { AuthModule } from '../auth/auth.module';
import { WorkspaceResolver } from './workspace.resolver';
import { WorkspaceService } from './workspace.service';
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity,UserFollowsEntity,UserSettingEntity]), AuthModule],
  providers: [WorkspaceResolver, WorkspaceService],
})
export class UserModule { }
