import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { WorkspaceGatewayService } from './services/workspace.gateway';
import { EnvironmentGatewayService } from './services/environment.gateway';
import { CommentGatewayService } from './services/comments.gateway';
import { DocumentGatewayService } from './services/document.gateway';
import { ComponentGatewayService } from './services/reusable-component.gateway';
import { SessionModule } from '@/features/session/session.module';
import { JupyterModule } from '../jupyter/jupyter.module';
import { YjsModule } from '../../features/collaboration/yjs/yjs.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity, DocumentEntity, EnvironmentEntity, UserEntity, UserFollowsEntity, UserSettingEntity, UserWorkspaceEntity } from '@sandworm/postgresql-typeorm';
import { CodeExecutionModule } from '@/features/code-execution/code-execution.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            UserSettingEntity,
            UserFollowsEntity,
            UserWorkspaceEntity,
            EnvironmentEntity,
            DocumentEntity,
            CommentEntity
        ]), SessionModule, JupyterModule, YjsModule, CodeExecutionModule],
    providers: [
        AppGateway,
        WorkspaceGatewayService,
        EnvironmentGatewayService,
        CommentGatewayService,
        DocumentGatewayService,
        ComponentGatewayService,
    ],
    exports: [AppGateway],
})
export class WebsocketModule { }