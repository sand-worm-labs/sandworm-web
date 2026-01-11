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
  stop(): Promise<void>
  deploy(): Promise<void>
  restart(): Promise<void>
  ensureRunning(): Promise<void>
  isRunning(): Promise<boolean>
  fileExists(fileName: string): Promise<boolean>
  listFiles(): Promise<SandwormFile[]>
  getFile(fileName: string): Promise<GetFileResult | null>

  putFile(
    fileName: string,
    replace: boolean,
    file: Readable
  ): Promise<'success' | 'already-exists'>

  deleteFile(fileName: string): Promise<void>

  getServerSettings(
  ): Promise<services.ServerConnection.ISettings>

  setEnvironmentVariables(
    variables: EnvironmentVariables
  ): Promise<void>

  getEnvironmentStatus(): Promise<{
    status: string
    startedAt: Date | null
  }>
}