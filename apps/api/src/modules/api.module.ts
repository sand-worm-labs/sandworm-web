import { Module } from '@nestjs/common';
import { AuthGraphqlModule } from './auth-graphql/auth.module';
import { ProfileModule } from './profile/profile.module';
import { TagModule } from './tag/tag.module';
import { UserModule } from './user/user.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { DocumentModule } from './document/document.module';
import { CommentModule } from './comment/comment.module';
import { EnvironmentModule } from './environment/environment.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [UserModule, AuthGraphqlModule, ProfileModule, TagModule, WorkspaceModule, DocumentModule, CommentModule, EnvironmentModule, FileModule],
})
export class ApiModule {}
