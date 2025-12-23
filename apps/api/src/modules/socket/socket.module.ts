import { Module } from '@nestjs/common'
// import { SocketGateway } from './socket.gateway'
import { AuthModule } from '../auth/auth.module'
import { WorkspaceModule } from '../workspace/workspace.module'
import { DocumentModule } from '../document/document.module'
import { EnvironmentModule } from '../environment/environment.module'
// import { ComponentsModule } from '../components/components.module'
import { CommentModule } from '../comment/comment.module'
// import { PythonCompletionModule } from '../python-completion/python-completion.module'
import { TutorialModule } from '../tutorial/tutorial.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    WorkspaceModule,
    DocumentModule,
    EnvironmentModule,
    // ComponentsModule,
    CommentModule,
    // PythonCompletionModule,
    TutorialModule,
  ],
  providers: [],
  exports: [],
})
export class SocketModule { }