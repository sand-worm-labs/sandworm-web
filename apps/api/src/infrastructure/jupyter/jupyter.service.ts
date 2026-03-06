import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Readable } from 'stream';
import path from 'path';
import { SandwormJupyterExtension } from './Jupyter.extension.js';
import { GetFileResult, IJupyterService, EnvironmentVariables } from './jupyter.interface';
import { SandwormFile } from '@sandworm/types';
import services from '@jupyterlab/services';
import { EnvironmentEntity, EnvironmentStatus } from '@sandworm/postgresql-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JupyterService implements IJupyterService, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JupyterService.name);
  private readonly kernelManagers = new Map<string, services.KernelManager>();
  private readonly sessionManagers = new Map<string, services.SessionManager>();
  private readonly jupyterExtensions = new Map<string, SandwormJupyterExtension>();
  private readonly watchTimeouts = new Map<string, NodeJS.Timeout>();
  private readonly protocol: string;
  private readonly host: string;
  private readonly port: number;
  private readonly token: string;

  constructor(
    @InjectRepository(EnvironmentEntity)
    private readonly environmentRepository: Repository<EnvironmentEntity>,
    private readonly configService: ConfigService
  ) {
    this.protocol = this.configService.get('JUPYTER_PROTOCOL') || 'http';
    this.host = this.configService.get('JUPYTER_HOST') || 'localhost';
    this.port = this.configService.get('JUPYTER_PORT') || 8888;
    this.token = this.configService.get('JUPYTER_TOKEN') || '';
  }
  deploy(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('JupyterService initialized');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('JupyterService shutting down');
    for (const timeout of this.watchTimeouts.values()) {
      clearTimeout(timeout);
    }
    for (const sm of this.sessionManagers.values()) sm.dispose();
    for (const km of this.kernelManagers.values()) km.dispose();
    this.sessionManagers.clear();
    this.kernelManagers.clear();
    this.jupyterExtensions.clear();
    this.watchTimeouts.clear();
  }

  private getBaseURL(): string {
    return `${this.protocol}://${this.host}:${this.port}`;
  }

  private getExtension(workspaceId: string): SandwormJupyterExtension {
    if (!this.jupyterExtensions.has(workspaceId)) {
      this.jupyterExtensions.set(
        workspaceId,
        new SandwormJupyterExtension(this.protocol, this.host, this.port, this.token)
      );
    }
    return this.jupyterExtensions.get(workspaceId)!;
  }

  async getServerSettings(workspaceId?: string): Promise<services.ServerConnection.ISettings> {
    const wsUrl = this.getBaseURL().replace(this.protocol, this.protocol === 'https' ? 'wss' : 'ws');
    return {
      baseUrl: this.getBaseURL(),
      appUrl: this.getBaseURL(),
      wsUrl,
      token: this.token,
      appendToken: true,
      // @ts-ignore
      serializer: services.serialize,
      fetch,
      Request,
      Headers,
      // @ts-ignore
      WebSocket,
      init: {},
    } as services.ServerConnection.ISettings;
  }

  async bindWorkspace(workspaceId: string) {
    if (!this.kernelManagers.has(workspaceId)) {
      const serverSettings = await this.getServerSettings();
      this.kernelManagers.set(workspaceId, new services.KernelManager({ serverSettings }));
      this.sessionManagers.set(workspaceId, new services.SessionManager({
        kernelManager: this.kernelManagers.get(workspaceId)!,
        serverSettings
      }));
      this.getExtension(workspaceId); // ensure extension exists
      this.startPolling(workspaceId);
    }
  }

  private async startPolling(workspaceId: string) {
    const poll = async () => {
      let env = await this.environmentRepository.findOne({ where: { workspaceId } });
      if (!env) {
        env = await this.environmentRepository.save({
          workspaceId,
          status: EnvironmentStatus.STOPPED,
          resourceVersion: 0,
        });
      }

      try {
        const res = await fetch(`${this.getBaseURL()}/api/status`, {
          headers: { Authorization: `token ${this.token}` },
        });

        if (res.ok) {
          if (env.status !== EnvironmentStatus.RUNNING) {
            env.status = EnvironmentStatus.RUNNING;
            env.startedAt = new Date();
            await this.environmentRepository.save(env);
          }
        } else {
          env.status = EnvironmentStatus.STOPPED;
          await this.environmentRepository.save(env);
        }
      } catch (err) {
        this.logger.error({ workspaceId, err }, 'Failed to check Jupyter status');
      }

      this.watchTimeouts.set(workspaceId, setTimeout(poll, 5000));
    };

    await poll();
  }

  async start(): Promise<void> { }
  async stop(workspaceId: string): Promise<void> {
    const timeout = this.watchTimeouts.get(workspaceId);
    if (timeout) clearTimeout(timeout);
  }
  async restart(workspaceId: string): Promise<void> {
    this.stop(workspaceId);
    this.kernelManagers.get(workspaceId)?.dispose();
    this.sessionManagers.get(workspaceId)?.dispose();
    this.kernelManagers.delete(workspaceId);
    this.sessionManagers.delete(workspaceId);
    this.jupyterExtensions.delete(workspaceId);
  }

  async ensureRunning(workspaceId: string): Promise<void> { }
  async isRunning(workspaceId: string): Promise<boolean> { return true; }

  async fileExists(workspaceId: string, fileName: string): Promise<boolean> {
    const ext = this.getExtension(workspaceId);
    const result = await ext.statFile(await this.getFilepath(workspaceId, fileName));
    if (result._tag === 'error') {
      if (result.reason === 'not-found') return false;
      throw new Error(`Failed to stat file: ${result.reason}`);
    }
    return true;
  }

  async getFile(workspaceId: string, fileName: string): Promise<GetFileResult | null> {
    const ext = this.getExtension(workspaceId);
    const result = await ext.readFile(await this.getFilepath(workspaceId, fileName));
    if (result._tag === 'error') {
      if (result.reason === 'not-found') return null;
      throw new Error(`Failed to read file: ${result.reason}`);
    }

    return {
      size: result.size,
      stream: result.stream,
      exitCode: new Promise<number>((resolve, reject) => {
        result.stream.on('error', reject);
        result.stream.on('finish', () => resolve(0));
      }),
    };
  }

  async putFile(workspaceId: string, fileName: string, replace: boolean, file: Readable): Promise<'success' | 'already-exists'> {
    const ext = this.getExtension(workspaceId);
    const actualPath = await this.getFilepath(workspaceId, fileName);
    const statResult = await ext.statFile(actualPath);
    if (statResult._tag === 'error' && statResult.reason !== 'not-found') throw new Error(`Failed to stat file: ${statResult.reason}`);
    if (statResult._tag === 'success' && !replace) return 'already-exists';
    const result = await ext.writeFile(actualPath, file);
    if (result._tag === 'error') throw new Error(`Failed to write file: ${result.reason}`);
    return 'success';
  }

  async deleteFile(workspaceId: string, fileName: string): Promise<void> {
    const ext = this.getExtension(workspaceId);
    const result = await ext.deleteFile(await this.getFilepath(workspaceId, fileName));
    if (result._tag === 'error' && result.reason !== 'not-found') throw new Error(`Failed to delete file: ${result.reason}`);
  }

  async listFiles(workspaceId: string): Promise<SandwormFile[]> {
    const ext = this.getExtension(workspaceId);
    const cwd = await ext.getCWD();
    const result = await ext.listFiles(cwd);
    if (result._tag === 'error') throw new Error(`Failed to list files: ${result.reason}`);
    return result.files.map(f => ({
      name: f.name,
      path: f.path,
      relCwdPath: path.relative(cwd, f.path),
      size: f.size,
      mimeType: f.mimeType ?? null,
      createdAt: f.created,
      isDirectory: f.isDirectory,
    }));
  }

  async setEnvironmentVariables(workspaceId: string, variables: EnvironmentVariables): Promise<void> {
    // await this.environmentService.setEnvironmentVariables(workspaceId, variables);
  }

  async getEnvironmentStatus(workspaceId: string): Promise<{ status: string; startedAt: Date | null }> {
    const env = await this.environmentRepository.findOne({ where: { workspaceId } });
    return { status: env?.status ?? 'Stopped', startedAt: env?.startedAt ?? null };
  }

  private async getFilepath(workspaceId: string, fileName: string): Promise<string> {
    const ext = this.getExtension(workspaceId);
    const cwd = await ext.getCWD();
    return path.join(cwd, path.join('/', fileName));
  }
}
