import { INestApplication, WebSocketAdapter } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { WsAdapter } from '@nestjs/platform-ws';
import { GatewayMetadata, WebSocketGateway } from '@nestjs/websockets';
import * as SocketIO from 'socket.io';
import * as WebSocket from 'ws';

export enum SocketServerType {
    SOCKET_IO = 'socket.io',
    WEBSOCKET = 'ws',
}

export interface SocketServerOptions {
    type: SocketServerType;
    [key: string]: any;
}

export class UnifiedSocketAdapter implements WebSocketAdapter {
    private readonly ioAdapter: IoAdapter;
    private readonly wsAdapter: WsAdapter;
    private readonly serverTypeMap = new WeakMap<any, SocketServerType>();

    constructor(app: INestApplication) {
        this.ioAdapter = new IoAdapter(app);
        this.wsAdapter = new WsAdapter(app);
    }

    private isSocketIOServer(server: any): boolean {
        return server instanceof SocketIO.Namespace || server instanceof SocketIO.Server;
    }

    private isWebSocketServer(server: any): boolean {
        return server instanceof WebSocket.Server;
    }

    private isSocketIOClient(client: any): boolean {
        return client instanceof SocketIO.Socket;
    }

    private isWebSocketClient(client: any): boolean {
        return client instanceof WebSocket.WebSocket;
    }

    create(port: number, options?: any): any {
        if (!options?.type) {
            throw new Error('Socket server type must be specified in options');
        }

        const { type, ...adapterOptions } = options;

        let server: any;

        if (type === SocketServerType.SOCKET_IO) {
            server = this.ioAdapter.create(port, adapterOptions);
        } else if (type === SocketServerType.WEBSOCKET) {
            server = this.wsAdapter.create(port, adapterOptions);
        } else {
            throw new Error('Unknown server type: ' + type);
        }

        // Store the server type for later retrieval
        this.serverTypeMap.set(server, type);

        return server;
    }

    bindClientConnect(server: any, callback: Function): any {
        // First check if we stored the type during create
        const storedType = this.serverTypeMap.get(server);

        if (storedType === SocketServerType.SOCKET_IO || this.isSocketIOServer(server)) {
            return this.ioAdapter.bindClientConnect(server, callback);
        } else if (storedType === SocketServerType.WEBSOCKET || this.isWebSocketServer(server)) {
            return this.wsAdapter.bindClientConnect(server, callback);
        }

        console.error('Unknown server in bindClientConnect:', {
            serverConstructor: server?.constructor?.name,
            storedType,
            isSocketIO: this.isSocketIOServer(server),
            isWebSocket: this.isWebSocketServer(server),
        });

        throw new Error('Unknown server type in bindClientConnect');
    }

    bindClientDisconnect(client: any, callback: Function): any {
        if (this.isSocketIOClient(client)) {
            return this.ioAdapter.bindClientDisconnect?.(client, callback);
        } else if (this.isWebSocketClient(client)) {
            return this.wsAdapter.bindClientDisconnect?.(client, callback);
        }

        console.error('Unknown client in bindClientDisconnect:', {
            clientConstructor: client?.constructor?.name,
        });

        throw new Error('Unknown client type in bindClientDisconnect');
    }

    bindMessageHandlers(
        client: any,
        handlers: any[],
        transform: (data: any) => any,
    ): any {
        if (this.isSocketIOClient(client)) {
            return this.ioAdapter.bindMessageHandlers(client, handlers, transform);
        } else if (this.isWebSocketClient(client)) {
            return this.wsAdapter.bindMessageHandlers(client, handlers, transform);
        }

        console.error('Unknown client in bindMessageHandlers:', {
            clientConstructor: client?.constructor?.name,
        });

        throw new Error('Unknown client type in bindMessageHandlers');
    }

    close(server: any): any {
        const storedType = this.serverTypeMap.get(server);

        if (storedType === SocketServerType.SOCKET_IO || this.isSocketIOServer(server)) {
            this.serverTypeMap.delete(server);
            return this.ioAdapter.close(server);
        } else if (storedType === SocketServerType.WEBSOCKET || this.isWebSocketServer(server)) {
            this.serverTypeMap.delete(server);
            return this.wsAdapter.close(server);
        }

        console.error('Unknown server in close:', {
            serverConstructor: server?.constructor?.name,
            storedType,
        });

        throw new Error('Unknown server type in close');
    }
}

export const UnifiedSocketGateway = WebSocketGateway<
    GatewayMetadata & SocketServerOptions
>;