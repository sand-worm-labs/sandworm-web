import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets'
import { Logger } from '@nestjs/common'
import { createAdapter } from '@socket.io/postgres-adapter'
import cookie from 'cookie'
import { ReusableComponentEntity, getPGInstance } from '@sandworm/postgresql-typeorm'
import { PythonSuggestionsResult, Comment } from '@sandworm/types'
import { TypedServer, TypedSocket } from './socket.types'
import { ConfigService } from '../config/config.service'
import { AuthService } from '../auth/auth.service'
import { WorkspaceService } from '../workspace/workspace.service'
import { EnvironmentService } from '../environment/environment.service'
import { DataSourcesService } from '../data-sources/data-sources.service'
import { ComponentsService } from '../components/components.service'
import { CommentsService } from '../comments/comments.service'
import { PythonCompletionService } from '../python-completion/python-completion.service'

@WebSocketGateway({
  cors: {
    credentials: true,
    origin: process.env.FRONTEND_URL,
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SocketGateway.name)

  @WebSocketServer()
  server: TypedServer

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly workspaceService: WorkspaceService,
    private readonly environmentService: EnvironmentService,
    private readonly dataSourcesService: DataSourcesService,
    private readonly componentsService: ComponentsService,
    private readonly commentsService: CommentsService,
    private readonly pythonCompletionService: PythonCompletionService
  ) { }

  async afterInit(server: TypedServer) {
    const { pool } = await getPGInstance()
    server.adapter(
      createAdapter(pool, {
        tableName: 'socket_io_attachments',
        errorHandler: (err) => {
          this.logger.error('Error in @socket.io/postgres-adapter', err)
        },
      })
    )

    server.use(async (socket: TypedSocket, next) => {
      try {
        const cookiesHeader = socket.handshake.headers.cookie
        const cookies = cookie.parse(cookiesHeader ?? '')

        const session = await this.authService.sessionFromCookies(cookies)
        if (session) {
          socket.session = session
          next()
        } else {
          next(new Error('Unauthorized'))
        }
      } catch (err) {
        this.logger.error('Error authenticating socket connection', {
          err,
          socketId: socket.id,
        })
        next(new Error('Internal Server Error'))
      }
    })

    this.logger.log('WebSocket Gateway initialized')
  }

  handleConnection(socket: TypedSocket) {
    this.logger.log(`Client connected: ${socket.id}`)

    if (!socket.session) {
      this.logger.error('Socket connection did not have a session', {
        socketId: socket.id,
      })
      socket.disconnect(true)
    }
  }

  handleDisconnect(socket: TypedSocket) {
    this.logger.log(`Client disconnected: ${socket.id}`)
  }

  @SubscribeMessage('join-workspace')
  async handleJoinWorkspace(
    @ConnectedSocket() socket: TypedSocket,
    @MessageBody() data: unknown
  ) {
    if (!socket.session) return
    await this.workspaceService.joinWorkspace(
      this.server,
      socket,
      socket.session,
      data
    )
  }

  @SubscribeMessage('leave-workspace')
  async handleLeaveWorkspace(
    @ConnectedSocket() socket: TypedSocket,
    @MessageBody() data: unknown
  ) {
    if (!socket.session) return
    await this.workspaceService.leaveWorkspace(socket, socket.session, data)
  }

  @SubscribeMessage('get-environment-status')
  async handleGetEnvironmentStatus(
    @ConnectedSocket() socket: TypedSocket,
    @MessageBody() data: unknown
  ) {
    if (!socket.session) return
    await this.environmentService.getEnvironmentStatus(
      socket,
      socket.session,
      data
    )
  }

  @SubscribeMessage('restart-environment')
  async handleRestartEnvironment(
    @ConnectedSocket() socket: TypedSocket,
    @MessageBody() data: unknown
  ) {
    if (!socket.session) return
    await this.environmentService.restartEnvironment(
      socket,
      socket.session,
      data
    )
  }

  @SubscribeMessage('complete-python')
  async handleCompletePython(
    @ConnectedSocket() socket: TypedSocket,
    @MessageBody() data: unknown
  ): Promise<PythonSuggestionsResult> {
    if (!socket.session) {
      return { status: 'unexpected-error' }
    }
    return this.pythonCompletionService.completePython(
      this.server,
      socket,
      socket.session,
      data
    )
  }

  @SubscribeMessage('workspace-datasources-refresh-all')
  async handleRefreshDataSources(
    @ConnectedSocket() socket: TypedSocket,
    @MessageBody() data: unknown
  ) {
    if (!socket.session) return
    await this.dataSourcesService.refreshDataSources(
      this.server,
      socket,
      socket.session,
      data
    )
  }

  @SubscribeMessage('workspace-datasources-refresh-one')
  async handleRefreshDataSource(
    @ConnectedSocket() socket: TypedSocket,
    @MessageBody() data: unknown
  ) {
    if (!socket.session) return
    await this.dataSourcesService.refreshDataSource(
      this.server,
      socket,
      socket.session,
      data
    )
  }

  @SubscribeMessage('fetch-document-comments')
  async handleFetchDocumentComments(
    @ConnectedSocket() socket: TypedSocket,
    @MessageBody() data: unknown
  ) {
    if (!socket.session) return
    await this.commentsService.fetchDocumentComments(socket, socket.session, data)
  }

  // Broadcast methods for use by other services
  broadcastComponent(component: ReusableComponentEntity) {
    this.componentsService.broadcastComponent(this.server, component)
  }

  broadcastComponentRemoved(workspaceId: string, componentId: string) {
    this.componentsService.broadcastComponentRemoved(
      this.server,
      workspaceId,
      componentId
    )
  }

  broadcastComment(workspaceId: string, documentId: string, comment: Comment) {
    this.commentsService.broadcastComment(
      this.server,
      workspaceId,
      documentId,
      comment
    )
  }

  broadcastCommentDeleted(
    workspaceId: string,
    documentId: string,
    commentId: string
  ) {
    this.commentsService.broadcastCommentDeleted(
      this.server,
      workspaceId,
      documentId,
      commentId
    )
  }
}