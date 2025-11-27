import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { SandwormFile } from '@sandworm/types'
import services from '@jupyterlab/services'
import { GetFileResult, IJupyterService, EnvironmentVariables } from './jupyter.interface'

@Injectable()
export class JupyterService implements IJupyterService, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JupyterService.name)

  constructor() {
    // empty constructor
  }

  async onModuleInit(): Promise<void> {
    return
  }

  async onModuleDestroy(): Promise<void> {
    return
  }

  private get baseURL(): string {
    return ''
  }

  async start(): Promise<void> {
    return
  }

  async stop(): Promise<void> {
    return
  }

  async deploy(): Promise<void> {
    return
  }

  async restart(workspaceId: string): Promise<void> {
    return
  }

  async ensureRunning(workspaceId: string): Promise<void> {
    return
  }

  async isRunning(workspaceId: string): Promise<boolean> {
    return false
  }

  async fileExists(workspaceId: string, fileName: string): Promise<boolean> {
    return false
  }

  async getFile(workspaceId: string, fileName: string): Promise<GetFileResult | null> {
    return null
  }

  async putFile(
    workspaceId: string,
    fileName: string,
    replace: boolean,
    file: unknown
  ): Promise<'success' | 'already-exists'> {
    return 'success'
  }

  async deleteFile(workspaceId: string, fileName: string): Promise<void> {
    return
  }

  async listFiles(workspaceId: string): Promise<SandwormFile[]> {
    return []
  }

  async getServerSettings(workspaceId: string): Promise<services.ServerConnection.ISettings> {
    return {} as services.ServerConnection.ISettings
  }

  async setEnvironmentVariables(
    workspaceId: string,
    variables: EnvironmentVariables
  ): Promise<void> {
    return
  }

  async getEnvironmentStatus(workspaceId: string): Promise<{ status: string; startedAt: Date | null }> {
    return { status: '', startedAt: null }
  }

  private async getFilepath(fileName: string): Promise<string> {
    return ''
  }
}
