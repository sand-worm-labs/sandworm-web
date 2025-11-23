import { Injectable } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import { ISocketAdapter } from './socket-adapter.interface'

@Injectable()
export class SocketIOAdapter implements ISocketAdapter {
  private io: Server | null = null

  setServer(io: Server) {
    this.io = io
  }

  private getServer(): Server {
    if (!this.io) {
      throw new Error('Socket.IO server not initialized')
    }
    return this.io
  }

  emit(event: string, data: any): void {
    this.getServer().emit(event, data)
  }

  on(event: string, handler: (data: any) => void): void {
    this.getServer().on(event, handler)
  }

  broadcast(channel: string, event: string, data: any): void {
    this.getServer().emit(`${channel}:${event}`, data)
  }

  broadcastToRoom(room: string, event: string, data: any): void {
    this.getServer().to(room).emit(event, data)
  }
}
