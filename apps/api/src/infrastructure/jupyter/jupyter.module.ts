import { Module } from '@nestjs/common'
import { JupyterService } from './jupyter.service'

@Module({
  providers: [JupyterService],
  exports: [JupyterService],
})
export class JupyterModule { }
