import { Module } from '@nestjs/common';
import { AuthGraphqlModule } from '@/features/auth/graphql/auth-graphql.module';
import { ProfileModule } from '@/features/profile/profile.module';
import { TagModule } from '@/features/tag/tag.module';
import { UserModule } from '@/features/user/user.module';
import { WorkspaceModule } from '@/features/workspace/workspace.module';
import { DocumentModule } from '@/features/document/document.module';
import { CommentModule } from '@/features/collaboration/comment/comment.module';
import { EnvironmentModule } from '@/features/environment/environment.module';
import { FileModule } from '@/features/file/file.module';
import { AuthModule } from '@/features/auth/core/auth.module';
import { AuthGoogleModule } from '@/features/auth/google/auth-google.module';
import { MailModule } from '@/infrastructure/mail/mail.module';
import { SessionModule } from '@/features/session/session.module';
import { MailerModule } from '@/infrastructure/mailer/mailer.module';
import { AuthGithubModule } from '@/features/auth/github/auth-github.module';
import { ScheduleModule } from '@/features/schedule/schedule.module';
import { JupyterModule } from './infrastructure/jupyter/jupyter.module';
import { WebsocketModule } from './infrastructure/websocket/websocket.module';

@Module({
    imports: [
        // User & Profile
        UserModule,
        ProfileModule,

        // Auth
        AuthModule,
        AuthGraphqlModule,
        AuthGoogleModule,
        AuthGithubModule,

        // Infrastructure
        MailModule,
        MailerModule,
        SessionModule,
        JupyterModule,

        // Features
        WorkspaceModule,
        DocumentModule,
        CommentModule,
        EnvironmentModule,
        FileModule,
        TagModule,
        ScheduleModule,

        WebsocketModule
    ],
})
export class ApiModule { }