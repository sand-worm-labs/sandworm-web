import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
  } from '@nestjs/websockets'
  import { Server } from 'socket.io'
  import { JupyterService } from './jupyter/jupyter.service'
  import { SocketIOAdapter } from './adapters/socket-io.adapter'
  
  @WebSocketGateway()
  export class AppGateway implements OnGatewayInit {
    @WebSocketServer()
    server: Server
  
    constructor(
      private jupyterService: JupyterService,
      private socketIOAdapter: SocketIOAdapter
    ) {}
  
    afterInit(server: Server) {
      this.socketIOAdapter.setServer(server)
      this.jupyterService.setSocketAdapter(this.socketIOAdapter)
      
      this.jupyterService.start()
        .catch(err => console.error('Failed to start Jupyter service', err))
    }
  
    handleDisconnect(client: any) {
      console.log(`Client ${client.id} disconnected`)
    }
  
    handleConnection(client: any) {
      console.log(`Client ${client.id} connected`)
    }
  }