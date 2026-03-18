import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppGateway } from './app.gateway';
import { WorkspaceGatewayService } from './services/workspace.gateway';
import { EnvironmentGatewayService } from './services/environment.gateway';
import { CommentGatewayService } from './services/comments.gateway';
import { DocumentGatewayService } from './services/document.gateway';
import { ComponentGatewayService } from './services/reusable-component.gateway';
import { JupyterModule } from '../jupyter/jupyter.module';
import { YjsModule } from '../../features/collaboration/yjs/yjs.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity, DocumentEntity, EnvironmentEntity, ReusableComponentEntity, UserEntity, UserFollowsEntity, UserSettingEntity, UserWorkspaceEntity } from '@sandworm/postgresql-typeorm';
import { CodeExecutionModule } from '@/features/code-execution/code-execution.module';
import { ReusableComponentModule } from '@/features/collaboration/component/reusable-component.module';
import { AuthModule } from '@/features/auth/core/auth.module';
import { PythonCompletionService } from '@/features/code-execution/python-completion.service';

@Module({
    imports: [
        AuthModule,
        TypeOrmModule.forFeature([
            UserEntity,
            UserSettingEntity,
            UserFollowsEntity,
            UserWorkspaceEntity,
            EnvironmentEntity,
            DocumentEntity,
            CommentEntity,
            ReusableComponentEntity
        ]),  JupyterModule, YjsModule, CodeExecutionModule, ReusableComponentModule, JwtModule.register({})],
    providers: [
        AppGateway,
        WorkspaceGatewayService,
        EnvironmentGatewayService,
        CommentGatewayService,
        DocumentGatewayService,
        ComponentGatewayService,
        PythonCompletionService
    ],
    exports: [AppGateway],
})
export class WebsocketModule { }