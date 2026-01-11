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
import { EnvironmentService } from '@/features/environment/environment.service.js';

@Injectable()
export class JupyterService implements IJupyterService, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JupyterService.name);

  private workspaceId?: string;
  private kernelManager?: services.KernelManager;
  private sessionManager?: services.SessionManager;
  private jupyterExtension?: SandwormJupyterExtension;

  private watchTimeout?: NodeJS.Timeout;

  constructor(
    @InjectRepository(EnvironmentEntity)
    private readonly environmentRepository: Repository<EnvironmentEntity>,
    private readonly environmentService: EnvironmentService,
    private readonly protocol = 'http',
    private readonly host = 'localhost',
    private readonly port = 8888,
    private readonly token = ''
  ) { }

  async onModuleInit(): Promise<void> {
    this.logger.log('JupyterService initialized');
    this.startPolling();
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('JupyterService shutting down');
    if (this.watchTimeout) clearTimeout(this.watchTimeout);
    this.disposeAll();
  }

  private get baseURL(): string {
    return `${this.protocol}://${this.host}:${this.port}`;
  }

  async bindWorkspace(workspaceId: string) {
    this.workspaceId = workspaceId;
    const serverSettings = await this.getServerSettings();

    this.kernelManager = new services.KernelManager({ serverSettings });
    this.sessionManager = new services.SessionManager({ kernelManager: this.kernelManager, serverSettings });
    this.jupyterExtension = new SandwormJupyterExtension(this.protocol, this.host, this.port, this.token);
  }

  private async startPolling(): Promise<void> {
    const poll = async () => {
      if (!this.workspaceId) return;

      let env = await this.environmentRepository.findOne({ where: { workspaceId: this.workspaceId } });
      if (!env) {
        env = await this.environmentRepository.save({
          workspaceId: this.workspaceId,
          status: EnvironmentStatus.STOPPED,
          resourceVersion: 0,
        });
      }

      try {
        const res = await fetch(`${this.baseURL}/api/status`, {
          headers: { Authorization: `token ${this.token}` },
        });

        if (res.ok) {
          if (env.status !== 'Running') {
            env.status = EnvironmentStatus.RUNNING;
            env.startedAt = new Date();
            await this.environmentRepository.save(env);
          }
        } else {
          env.status = EnvironmentStatus.STOPPED;
          await this.environmentRepository.save(env);
        }
      } catch (err) {
        this.logger.error({ workspaceId: this.workspaceId, err }, 'Failed to check Jupyter status');
      }

      this.watchTimeout = setTimeout(poll, 5000);
    };

    await poll();
  }

  async start(): Promise<void> { }
  async stop(): Promise<void> {
    if (this.watchTimeout) clearTimeout(this.watchTimeout);
  }
  async deploy(): Promise<void> { }
  async restart(): Promise<void> {
    if (!this.workspaceId) throw new Error('No workspace bound');
    this.disposeAll();
  }

  async ensureRunning(): Promise<void> { }
  async isRunning(): Promise<boolean> {
    return true;
  }

  async fileExists(fileName: string): Promise<boolean> {
    if (!this.jupyterExtension) throw new Error('Workspace not bound');
    const actualPath = await this.getFilepath(fileName);
    const result = await this.jupyterExtension.statFile(actualPath);

    if (result._tag === 'error') {
      if (result.reason === 'not-found') return false;
      throw new Error(`Failed to stat file: ${result.reason}`);
    }
    return true;
  }

  async getFile(fileName: string): Promise<GetFileResult | null> {
    if (!this.jupyterExtension) throw new Error('Workspace not bound');
    const actualPath = await this.getFilepath(fileName);
    const result = await this.jupyterExtension.readFile(actualPath);

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

  async putFile(fileName: string, replace: boolean, file: Readable): Promise<'success' | 'already-exists'> {
    if (!this.jupyterExtension) throw new Error('Workspace not bound');
    const actualPath = await this.getFilepath(fileName);
    const statResult = await this.jupyterExtension.statFile(actualPath);

    if (statResult._tag === 'error' && statResult.reason !== 'not-found') {
      throw new Error(`Failed to stat file: ${statResult.reason}`);
    }
    if (statResult._tag === 'success' && !replace) return 'already-exists';

    const result = await this.jupyterExtension.writeFile(actualPath, file);
    if (result._tag === 'error') throw new Error(`Failed to write file: ${result.reason}`);
    return 'success';
  }

  async deleteFile(fileName: string): Promise<void> {
    if (!this.jupyterExtension) throw new Error('Workspace not bound');
    const result = await this.jupyterExtension.deleteFile(await this.getFilepath(fileName));
    if (result._tag === 'error' && result.reason !== 'not-found') {
      throw new Error(`Failed to delete file: ${result.reason}`);
    }
  }

  async listFiles(): Promise<SandwormFile[]> {
    if (!this.jupyterExtension) throw new Error('Workspace not bound');
    const cwd = await this.jupyterExtension.getCWD();
    const result = await this.jupyterExtension.listFiles(cwd);
    if (result._tag === 'error') throw new Error(`Failed to list files: ${result.reason}`);

    return result.files.map((f) => ({
      name: f.name,
      path: f.path,
      relCwdPath: path.relative(cwd, f.path),
      size: f.size,
      mimeType: f.mimeType ?? null,
      createdAt: f.created,
      isDirectory: f.isDirectory,
    }));
  }

  async getServerSettings(): Promise<services.ServerConnection.ISettings> {
    const wsUrl = this.baseURL.replace(this.protocol, this.protocol === 'https' ? 'wss' : 'ws');
    return {
      baseUrl: this.baseURL,
      appUrl: this.baseURL,
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

  async setEnvironmentVariables(variables: EnvironmentVariables): Promise<void> {
    if (!this.workspaceId) throw new Error('Workspace not bound');
    await this.environmentService.setEnvironmentVariables(this.workspaceId, variables);
  }

  async getEnvironmentStatus(): Promise<{ status: string; startedAt: Date | null }> {
    if (!this.workspaceId) throw new Error('Workspace not bound');
    const env = await this.environmentRepository.findOne({ where: { workspaceId: this.workspaceId } });
    return { status: env?.status ?? 'Stopped', startedAt: env?.startedAt ?? null };
  }

  private async getFilepath(fileName: string): Promise<string> {
    if (!this.jupyterExtension) throw new Error('Workspace not bound');
    const cwd = await this.jupyterExtension.getCWD();
    return path.join(cwd, path.join('/', fileName));
  }

  private disposeAll() {
    if (this.sessionManager) this.sessionManager.dispose();
    if (this.kernelManager) this.kernelManager.dispose();

    this.jupyterExtension = undefined;
    this.sessionManager = undefined;
    this.kernelManager = undefined;
    this.workspaceId = undefined;
  }
}
