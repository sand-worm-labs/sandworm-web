import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { TagModule } from './tag/tag.module';
import { UserModule } from './user/user.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { DocumentModule } from './document/document.module';
import { CommentModule } from './comment/comment.module';
import { EnvironmentModule } from './environment/environment.module';
// import { TutorialModule } from './tutorial/tutorial.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [UserModule, AuthModule, ProfileModule, TagModule, WorkspaceModule, DocumentModule, CommentModule, EnvironmentModule, FileModule],
})
export class ApiModule {}
