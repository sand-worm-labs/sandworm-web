import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { WorkspaceGatewayService } from './services/workspace.gateway';
import { EnvironmentGatewayService } from './services/environment.gateway';
import { PythonCompletionService } from './services/python-completion.service';
import { CommentGatewayService } from './services/comments.gateway';
import { DocumentGatewayService } from './services/document.gateway';
import { ComponentGatewayService } from './services/reusable-component.gateway';
import { SessionModule } from '@/features/session/session.module';
import { JupyterModule } from '../jupyter/jupyter.module';
import { YjsModule } from '../../features/collaboration/yjs/yjs.module';

@Module({
    imports: [SessionModule, JupyterModule, YjsModule],
    providers: [
        AppGateway,
        WorkspaceGatewayService,
        EnvironmentGatewayService,
        PythonCompletionService,
        CommentGatewayService,
        DocumentGatewayService,
        ComponentGatewayService,
    ],
    exports: [AppGateway],
})
export class WebsocketModule { }