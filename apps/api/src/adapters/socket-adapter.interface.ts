export interface ISocketAdapter {
    emit(event: string, data: any): void
    on(event: string, handler: (data: any) => void): void
    broadcast(channel: string, event: string, data: any): void
    broadcastToRoom(room: string, event: string, data: any): void
}
  