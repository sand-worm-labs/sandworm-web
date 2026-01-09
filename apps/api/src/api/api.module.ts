import { Module } from '@nestjs/common';
import { AuthGraphqlModule } from './auth-graphql/auth-graphql.module';
import { ProfileModule } from './profile/profile.module';
import { TagModule } from './tag/tag.module';
import { UserModule } from './user/user.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { DocumentModule } from './document/document.module';
import { CommentModule } from './comment/comment.module';
import { EnvironmentModule } from './environment/environment.module';
import { FileModule } from './file/file.module';
import { AuthModule } from './auth/auth.module';
import { AuthGoogleModule } from './auth-google/auth-google.module';
import { MailModule } from './mail/mail.module';
import { SessionModule } from './session/session.module';
import { MailerModule } from './mailer/mailer.module'
import { AuthGithubModule } from './auth-github/auth-github.module';
import { ScheduleModule } from './schedule/schedule.module';

@Module({
  imports: [UserModule, AuthGraphqlModule, AuthModule, AuthGoogleModule, AuthGithubModule, MailModule, ScheduleModule, SessionModule, MailerModule, ProfileModule, TagModule, WorkspaceModule, DocumentModule, CommentModule, EnvironmentModule, FileModule],
})
export class ApiModule { }
