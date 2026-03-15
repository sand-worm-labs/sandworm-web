import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import WebSocket from 'ws';
import * as http from 'http';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as cookie from 'cookie';
import qs from 'querystring';
import { z } from 'zod';
import {
  DocumentEntity,
  UserWorkspaceEntity,
  UserWorkspaceRole,
  UserWorkspaceStatus,
  YjsAppDocumentEntity,
} from '@sandworm/postgresql-typeorm';
import { AuthService } from '@/features/auth/core/auth.service';
import { ACCESS_TOKEN_COOKIE } from '@/features/auth/core/utils/cookie';
import { YjsDocumentService } from './yjs-document.service';
import { PersistorFactory } from './persistors/persistor.factory';
import { WSSharedDocV2 } from './shared-doc/ws-shared-doc';
import { TransactionOrigin } from './interfaces';
import { MESSAGE_AWARENESS, MESSAGE_SYNC, PING_TIMEOUT } from './types/yjs.types';
import { MessageHandlerService } from './services/message-handler.service';
import { SyncHandlerService } from './services/sync-handler.service';

interface RequestData {
  document: DocumentEntity;
  clock: number;
  authUser: any;
  role: UserWorkspaceRole;
  isApp: boolean;
  userId: string | null;
  yjsAppDocumentId: string | null;
}

@Injectable()
export class YjsGateway implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(YjsGateway.name);
  private wss: WebSocket.Server;

  constructor(
    private readonly yjsDocumentService: YjsDocumentService,
    private readonly persistorFactory: PersistorFactory,
    private readonly authService: AuthService,
    private readonly messageHandler: MessageHandlerService,
    private readonly syncHandler: SyncHandlerService,
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectRepository(YjsAppDocumentEntity)
    private readonly yjsAppDocumentRepository: Repository<YjsAppDocumentEntity>,
  ) {}

  onModuleInit() {
    this.logger.log('YJS Gateway initialized');
  }

  public init(port: number) {
    this.wss = new WebSocket.Server({ port: port + 2 });
    this.wss.on('connection', async (socket, req) => {
      await this.handleConnection(socket, req);
    });
    this.logger.log(`YJS WebSocket server running on port ${port + 2}`);
  }

  private async handleConnection(client: WebSocket, req: http.IncomingMessage) {
    try {
      const url = new URL(req.url!, `http://${req.headers.host}`);
      if (!url.pathname.startsWith('/yjs')) {
        client.close(1008, 'Invalid path');
        return;
      }

      const data = await this.getRequestData(req);
      if (!data) {
        client.close(1008, 'Invalid request');
        return;
      }

      const { document, userId, authUser, role, isApp, clock, yjsAppDocumentId } = data;

      const doc = await this.getDoc(document, isApp, userId, yjsAppDocumentId);

      if (!doc) {
        client.close(1011, 'Failed to load document');
        return;
      }

      // Clock validation
      if (doc.clock !== clock) {
        this.logger.warn(`Clock mismatch: client=${clock} doc=${doc.clock} for ${doc.id}`);
        client.close(1008, 'Clock mismatch');
        return;
      }

      doc.conns.set(client, new Set());
      client.binaryType = 'arraybuffer';

      const origin: TransactionOrigin = { conn: client, user: authUser, role };
      let lastRoleUpdate = Date.now();

      client.on('message', async (message: ArrayBuffer) => {
        try {
          // Revalidate role every 1 minute
          const now = Date.now();
          if (now - lastRoleUpdate > 60000) {
            lastRoleUpdate = now;

            const updatedRole = await this.getUserRole(authUser.id, document.workspaceId);

            if (!updatedRole || updatedRole === UserWorkspaceRole.VIEWER) {
              this.closeConn(doc, client);
              return;
            }

            origin.role = updatedRole;
          }

          this.messageHandler.handleMessage(doc, new Uint8Array(message), origin, (msg) => this.send(doc, client, msg),);
        } catch (err) {
          this.logger.error(`Message error: ${err}`);
        }
      });

      client.on('close', () => {
        this.closeConn(doc, client);
      });

      client.on('error', (err) => {
        this.logger.error(`WebSocket error: ${err.message}`);
      });

      this.setupPing(doc, client, authUser.id);
      this.syncHandler.sendInitialState(doc, (message) => this.send(doc, client, message));

      this.logger.log(`Connected: ${authUser.email} → ${doc.id}`);
    } catch (err) {
      this.logger.error(`Connection failed: ${err}`);
      client.close(1011, 'Internal server error');
    }
  }


  private send(doc: WSSharedDocV2, conn: WebSocket, message: Uint8Array) {
    if (conn.readyState !== WebSocket.OPEN) {
      this.closeConn(doc, conn);
      return;
    }
    try {
      conn.send(message, (err) => {
        if (err) {
          this.closeConn(doc, conn);
          if ((err as any).code !== 'EPIPE') {
            this.logger.error(`Send error: ${err.message}`);
          }
        }
      });
    } catch (err) {
      this.closeConn(doc, conn);
    }
  }

  private closeConn(doc: WSSharedDocV2, conn: WebSocket) {
    const controlledIds = doc.conns.get(conn);
    if (controlledIds !== undefined) {
      doc.conns.delete(conn);
      awarenessProtocol.removeAwarenessStates(doc.awareness, Array.from(controlledIds), null);
    }
    try { conn.close(); } catch {}
  }

  private setupPing(doc: WSSharedDocV2, conn: WebSocket, userId: string) {
    let pongReceived = true;

    const interval = setInterval(() => {
      if (!pongReceived) {
        if (doc.conns.has(conn)) {
          this.logger.warn(`Client ${userId} missed pong`);
          this.closeConn(doc, conn);
        }
        clearInterval(interval);
        return;
      }
      if (doc.conns.has(conn)) {
        pongReceived = false;
        try { conn.ping(); } catch {
          this.closeConn(doc, conn);
          clearInterval(interval);
        }
      }
    }, PING_TIMEOUT);

    conn.on('pong', () => { pongReceived = true; });
    conn.once('close', () => clearInterval(interval));
  }

  private async getDoc(
    document: DocumentEntity,
    isApp: boolean,
    userId: string | null,
    yjsAppDocumentId: string | null,
  ): Promise<WSSharedDocV2 | null> {
    try {
      if (isApp && yjsAppDocumentId) {
        const docId = this.persistorFactory.getDocId(document.id, {
          id: yjsAppDocumentId,
          userId,
        });
        const persistor = this.persistorFactory.createAppPersistor(
          document.id,
          yjsAppDocumentId,
          userId,
        );
        return await this.yjsDocumentService.getYDoc(docId, document.id, document.workspaceId, persistor);
      }

      const docId = this.persistorFactory.getDocId(document.id, null);
      const persistor = this.persistorFactory.createDocumentPersistor(document.id);
      return await this.yjsDocumentService.getYDoc(docId, document.id, document.workspaceId, persistor);
    } catch (err) {
      this.logger.error(`Failed to get doc: ${err}`);
      return null;
    }
  }

  private async getRequestData(req: http.IncomingMessage): Promise<RequestData | null> {
    try {
      const cookies = cookie.parse(req.headers.cookie ?? '');
      const query = qs.parse(req.url?.split('?')[1] ?? '');

      const docId = query['documentId'];
      const clock = parseInt((query['clock'] ?? '').toString());
      const isApp = query['isApp'] === 'true';
      const userId = query['userId']?.toString() ?? null;
      const authToken = cookies[ACCESS_TOKEN_COOKIE] ?? query[ACCESS_TOKEN_COOKIE]?.toString() ?? null;

      const args = z.object({
        docId: z.string().uuid(),
        clock: z.number().int(),
        isApp: z.boolean(),
        userId: z.string().uuid().nullable().optional(),
      }).safeParse({ docId, clock, isApp, userId });

      if (!args.success) {
        this.logger.warn('Invalid query params', args.error);
        return null;
      }

      const document = await this.documentRepository.findOne({ where: { id: args.data.docId } });
      if (!document) return null;

      const session = await this.authService.validateTokenAndGetUser(authToken);
      if (!session) return null;

      const entry = session.roles?.find(r => r[document.workspaceId]);
      const role = entry?.[document.workspaceId];
      if (!role) return null;

      if (args.data.userId && args.data.userId !== session.user.id) return null;

      let yjsAppDocumentId: string | null = null;
      if (args.data.isApp) {
        const appDoc = await this.yjsAppDocumentRepository.findOne({
          where: { documentId: args.data.docId },
          order: { createdAt: 'DESC' },
        });
        if (!appDoc) return null;
        yjsAppDocumentId = appDoc.id;
      }

      return {
        document,
        clock: args.data.clock,
        authUser: session.user,
        role: role as UserWorkspaceRole,
        isApp: args.data.isApp,
        userId: args.data.userId ?? null,
        yjsAppDocumentId,
      };
    } catch (err) {
      this.logger.error(`getRequestData failed: ${err}`);
      return null;
    }
  }

  private async getUserRole(userId: string, workspaceId: string): Promise<UserWorkspaceRole | null> {
    try {
      const uw = await this.userWorkspaceRepository.findOne({
        where: { userId, workspaceId, status: UserWorkspaceStatus.ACTIVE },
      });
      return uw?.role ?? null;
    } catch {
      return null;
    }
  }

  onModuleDestroy() {
    this.logger.log('Shutting down YJS Gateway');
    this.wss?.close();
  }
}