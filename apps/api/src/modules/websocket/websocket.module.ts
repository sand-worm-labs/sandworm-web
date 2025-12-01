import { Module } from '@nestjs/common';
import { WebSocketGateway } from './websocket.gateway';
import { YjsModule } from '../yjs/yjs.module';

@Module({
  imports: [YjsModule],
  providers: [WebSocketGateway],
  exports: [WebSocketGateway],
})
export class WebSocketModule {}