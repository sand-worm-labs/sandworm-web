import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger, UseFilters } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsJwtGuard } from '@/core/guards/ws-jwt.guard';
import { CurrentSession } from '@/core/decorators/session.decorator';
import { Session } from '@/features/session/domain/session';
import { WsExceptionFilter } from '@/core/filters/ws-exception.filter';
import { v4 as uuidv4 } from 'uuid';
import { createAdapter } from '@socket.io/postgres-adapter';
import { WorkspaceGatewayService } from './services/workspace.gateway';
import { EnvironmentGatewayService } from './services/environment.gateway';
import { PythonCompletionService } from '../../features/code-execution/python-completion.service';
import { CommentGatewayService } from './services/comments.gateway';
import { DataSource } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import {
  WorkspaceDocumentsEvent,
  DocumentUpdateEvent,
  EventNames as DocumentEventNames
} from '@/events/document.events';
import {
  EnvironmentStatusEvent,
  EventNames as EnvironmentEventNames
} from '@/events/environment.events';
import {
  WorkspaceComponentsEvent,
  ComponentUpdateEvent,
  ComponentRemovedEvent,
  EventNames as ComponentEventNames
} from '@/events/reusable-component.events';
import {
  CommentCreatedEvent,
  CommentDeletedEvent,
  CommentEventNames
} from '@/events/comment.events';


@WebSocketGateway({
  cors: {
    credentials: true,
    origin: (origin, callback) => callback(null, true),
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
})
@UseFilters(WsExceptionFilter)
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppGateway.name);
  private workInProgress = new Map<string, Promise<void>>();

  constructor(

    private readonly workspaceGatewayService: WorkspaceGatewayService,
    private readonly environmentGatewayService: EnvironmentGatewayService,
    private readonly pythonCompletionService: PythonCompletionService,
    private readonly commentGatewayService: CommentGatewayService,
    private readonly dataSource: DataSource
  ) {
    this.logger.log('🚀 AppGateway constructor called!');
  }

  async afterInit(server: Server): Promise<void> {
    try {
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
      }

      const pool = (this.dataSource.driver as any).master;

      if (!pool) {
        throw new Error('PostgreSQL pool not available from TypeORM');
      }

      server.adapter(
        createAdapter(pool, {
          tableName: 'socket_io_attachments',
          errorHandler: (err) => {
            this.logger.error('PostgreSQL adapter error', err);
          },
        })
      );

      server.engine.on('connection_error', (err) => {
        this.logger.error('Socket.IO connection error', {
          code: err.code,
          message: err.message,
        });
      });

      this.logger.log('WebSocket Gateway initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize WebSocket Gateway', error);
      throw error;
    }
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);

    client.on('error', (error) => {
      this.logger.error(`Socket error for client ${client.id}`, error);
    });
  }

  async handleDisconnect(client: Socket): Promise<void> {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Wait for ongoing work to finish
    while (this.workInProgress.size > 0) {
      this.logger.log(`Waiting for ${this.workInProgress.size} operations to complete`);
      await Promise.all(this.workInProgress.values());
    }
  }


  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join-workspace')
  async handleJoinWorkspace(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workspaceId: string },
    @CurrentSession() session: Session,
  ): Promise<void> {
    this.logger.log(`Joining workspace: ${data.workspaceId}`, `${{ ...session }}`);
    await this.trackWork(() =>
      this.workspaceGatewayService.joinWorkspace(client, data, session)
    );
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leave-workspace')
  async handleLeaveWorkspace(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workspaceId: string },
    @CurrentSession() session: Session,
  ): Promise<void> {
    await this.trackWork(() =>
      this.workspaceGatewayService.leaveWorkspace(client, data, session)
    );
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('get-environment-status')
  async handleGetEnvironmentStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workspaceId: string },
    @CurrentSession() session: Session,
  ): Promise<void> {
    await this.trackWork(() =>
      this.environmentGatewayService.getEnvironmentStatus(client, data, session)
    );
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('restart-environment')
  async handleRestartEnvironment(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workspaceId: string },
    @CurrentSession() session: Session,
  ): Promise<void> {
    await this.trackWork(() =>
      this.environmentGatewayService.restartEnvironment(client, data, session)
    );
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('complete-python')
  async handleCompletePython(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string; blockId: string; position: number },
    @CurrentSession() session: Session,
  ): Promise<void> {
    await this.trackWork(() =>
      this.pythonCompletionService.completePython(this.server, client, data, session)
    );
  }

  // @UseGuards(WsJwtGuard)
  // @SubscribeMessage('workspace-datasources-refresh-all')
  // async handleRefreshAllDataSources(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() data: { workspaceId: string },
  //   @CurrentSession() session: Session,
  // ): Promise<void> {
  //   await this.trackWork(() =>
  //     this.dataSourceGatewayService.refreshAllDataSources(this.server, client, data, session)
  //   );
  // }

  // @UseGuards(WsJwtGuard)
  // @SubscribeMessage('workspace-datasources-refresh-one')
  // async handleRefreshOneDataSource(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() data: {
  //     workspaceId: string;
  //     dataSourceId: string;
  //     dataSourceType: string;
  //   },
  //   @CurrentSession() session: Session,
  // ): Promise<void> {
  //   await this.trackWork(() =>
  //     this.dataSourceGatewayService.refreshOneDataSource(this.server, client, data, session)
  //   );
  // }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('fetch-document-comments')
  async handleFetchDocumentComments(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string },
    @CurrentSession() session: Session,
  ): Promise<void> {
    await this.trackWork(() =>
      this.commentGatewayService.fetchDocumentComments(client, data, session)
    );
  }

  @OnEvent(DocumentEventNames.WORKSPACE_DOCUMENTS)
  handleWorkspaceDocumentsEvent(event: WorkspaceDocumentsEvent): void {
    this.server.to(event.workspaceId).emit('workspace-documents', {
      workspaceId: event.workspaceId,
      documents: event.documents,
    });
    this.logger.debug(`Broadcasted workspace documents for ${event.workspaceId}`);
  }

  @OnEvent(DocumentEventNames.DOCUMENT_UPDATE)
  handleDocumentUpdateEvent(event: DocumentUpdateEvent): void {
    this.server.to(event.workspaceId).emit('workspace-document-update', {
      workspaceId: event.workspaceId,
      document: event.document,
    });
    this.logger.debug(`Broadcasted document update: ${event.document.id}`);
  }

  // Environment Events
  @OnEvent(EnvironmentEventNames.ENVIRONMENT_STATUS_UPDATE)
  handleEnvironmentStatusUpdateEvent(event: EnvironmentStatusEvent): void {
    this.server.to(event.workspaceId).emit('environment-status-update', {
      workspaceId: event.workspaceId,
      status: event.status,
      startedAt: event.startedAt,
    });
    this.logger.debug(`Broadcasted environment status for ${event.workspaceId}: ${event.status}`);
  }

  @OnEvent(EnvironmentEventNames.ENVIRONMENT_STATUS_ERROR)
  handleEnvironmentStatusErrorEvent(event: { workspaceId: string; error: string }): void {
    this.server.to(event.workspaceId).emit('environment-status-error', {
      workspaceId: event.workspaceId,
      error: event.error,
    });
    this.logger.debug(`Broadcasted environment error for ${event.workspaceId}`);
  }

  // Component Events
  @OnEvent(ComponentEventNames.WORKSPACE_COMPONENTS)
  handleWorkspaceComponentsEvent(event: WorkspaceComponentsEvent): void {
    this.server.to(event.workspaceId).emit('workspace-components', {
      workspaceId: event.workspaceId,
      components: event.components,
    });
    this.logger.debug(`Broadcasted workspace components for ${event.workspaceId}`);
  }

  @OnEvent(ComponentEventNames.COMPONENT_UPDATE)
  handleComponentUpdateEvent(event: ComponentUpdateEvent): void {
    this.server.to(event.workspaceId).emit('workspace-component-update', {
      workspaceId: event.workspaceId,
      component: event.component,
    });
    this.logger.debug(`Broadcasted component update: ${event.component.id}`);
  }

  @OnEvent(ComponentEventNames.COMPONENT_REMOVED)
  handleComponentRemovedEvent(event: ComponentRemovedEvent): void {
    this.server.to(event.workspaceId).emit('workspace-component-removed', {
      workspaceId: event.workspaceId,
      componentId: event.componentId,
    });
    this.logger.debug(`Broadcasted component removed: ${event.componentId}`);
  }

  // Comment Events
  @OnEvent(CommentEventNames.COMMENT_CREATED)
  handleCommentCreatedEvent(event: CommentCreatedEvent): void {
    // Find workspace for this document
    // TODO: You might need to inject DocumentRepository to get workspaceId
    this.server.emit('document-comment', {
      documentId: event.documentId,
      comment: event.comment,
      user: event.user,
    });
    this.logger.debug(`Broadcasted comment created for document ${event.documentId}`);
  }

  @OnEvent(CommentEventNames.COMMENT_DELETED)
  handleCommentDeletedEvent(event: CommentDeletedEvent): void {
    this.server.to(event.workspaceId).emit('document-comment-deleted', {
      workspaceId: event.workspaceId,
      documentId: event.documentId,
      commentId: event.commentId,
    });
    this.logger.debug(`Broadcasted comment deleted: ${event.commentId}`);
  }


  private async trackWork<T>(fn: () => Promise<T>): Promise<T> {
    const id = uuidv4();
    try {
      const promise = fn();
      this.workInProgress.set(id, promise as Promise<void>);
      return await promise;
    } finally {
      this.workInProgress.delete(id);
    }
  }

  getServer(): Server {
    return this.server;
  }
}