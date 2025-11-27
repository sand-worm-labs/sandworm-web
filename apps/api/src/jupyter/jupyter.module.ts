import { Module } from '@nestjs/common'
import { JupyterService } from './jupyter.service'
// import { SocketServerAdapter } from './jupyter.gateway'

@Module({
  providers: [JupyterService],
  exports: [JupyterService],
})
export class JupyterModule {}
