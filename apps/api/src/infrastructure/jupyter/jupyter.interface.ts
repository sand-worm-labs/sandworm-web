import { Readable } from 'stream'
import services from '@jupyterlab/services'
import { SandwormFile } from '@sandworm/types'

export type GetFileResult = {
  size: number
  stream: Readable
  exitCode: Promise<number>
}

export interface EnvironmentVariables {
  add: { name: string; value: string }[]
  remove: string[]
}

export interface IJupyterService {
  start(): Promise<void>
  stop(workspaceId: string): Promise<void>
  deploy(): Promise<void>
  restart(workspaceId: string): Promise<void>
  ensureRunning(workspaceId: string): Promise<void>
  isRunning(workspaceId: string): Promise<boolean>
  fileExists(workspaceId: string, fileName: string): Promise<boolean>
  listFiles(workspaceId: string): Promise<SandwormFile[]>
  getFile(workspaceId: string, fileName: string): Promise<GetFileResult | null>

  putFile(
    workspaceId: string,
    fileName: string,
    replace: boolean,
    file: Readable
  ): Promise<'success' | 'already-exists'>

  deleteFile(workspaceId: string, fileName: string): Promise<void>

  getServerSettings(): Promise<services.ServerConnection.ISettings>

  setEnvironmentVariables(
    workspaceId: string,
    variables: EnvironmentVariables
  ): Promise<void>

  getEnvironmentStatus(workspaceId: string): Promise<{
    status: string
    startedAt: Date | null
  }>
}