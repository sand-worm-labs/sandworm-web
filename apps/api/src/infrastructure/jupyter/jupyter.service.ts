import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Readable } from 'stream';
import path from 'path';
import services from '@jupyterlab/services';

import { SandwormJupyterExtension } from './Jupyter.extension.js';
import { GetFileResult, IJupyterService, EnvironmentVariables } from './jupyter.interface';
import { SandwormFile } from '@sandworm/types';
import { EnvironmentEntity, EnvironmentStatus } from '@sandworm/postgresql-typeorm';
import { EnvironmentStatusEvent, EventNames } from '@/events/environment.events';

@Injectable()
export class JupyterService implements IJupyterService, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JupyterService.name);

  // Per-workspace JupyterLab services (only needed for code execution)
  private readonly kernelManagers = new Map<string, services.KernelManager>();
  private readonly sessionManagers = new Map<string, services.SessionManager>();
  private readonly jupyterExtensions = new Map<string, SandwormJupyterExtension>();

  // Single global poll loop replacing per-workspace watchTimeouts
  private globalPollTimeout: NodeJS.Timeout | null = null;
  private isPolling = false;

  private readonly protocol: string;
  private readonly host: string;
  private readonly port: number;
  private readonly token: string;

  constructor(
    @InjectRepository(EnvironmentEntity)
    private readonly environmentRepository: Repository<EnvironmentEntity>,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.protocol = this.configService.get('JUPYTER_PROTOCOL') ?? 'http';
    this.host = this.configService.get('JUPYTER_HOST') ?? 'localhost';
    this.port = this.configService.get('JUPYTER_PORT') ?? 8888;
    this.token = this.configService.get('JUPYTER_TOKEN') ?? '';
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('JupyterService initialized');
    await this.start();
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('JupyterService shutting down');
    this.isPolling = false;
    if (this.globalPollTimeout) clearTimeout(this.globalPollTimeout);
    for (const sm of this.sessionManagers.values()) sm.dispose();
    for (const km of this.kernelManagers.values()) km.dispose();
    this.sessionManagers.clear();
    this.kernelManagers.clear();
    this.jupyterExtensions.clear();
  }

  async start(): Promise<void> {
    this.isPolling = true;
    await this.pingJupyterServer()
    this.logger.log('Starting Jupyter status polling');
    await this.poll();
  }

  private async poll(): Promise<void> {
    if (!this.isPolling) return;

    const environments = await this.environmentRepository.find({
      select: ['id', 'workspaceId', 'status', 'startedAt'],
    });

    await Promise.allSettled(
      environments.map(env => this.checkAndUpdateStatus(env))
    );

    this.globalPollTimeout = setTimeout(() => this.poll(), 5000);
  }


  private async pingJupyterServer() {
    const baseUrl = this.getBaseURL()
    const token = this.configService.get('JUPYTER_TOKEN')

    try {
      const res = await fetch(`${baseUrl}/api/status`, {
        headers: { Authorization: `token ${token}` },
        signal: AbortSignal.timeout(5000), // don't hang forever
      })
      if (res.ok) {
        this.logger.log('Jupyter server is reachable on init')
        // optionally bulk-update all workspace environments to Running
        //await this.environmentService.markAllRunning()
      } else {
        this.logger.warn(`Jupyter responded with ${res.status} on init`)
      }
    } catch (err) {
      this.logger.error({ err }, 'Jupyter server unreachable on init — will retry in polling loop')
      // don't throw — let the app boot, polling loop will reconcile
    }
  }

  private async checkAndUpdateStatus(env: EnvironmentEntity): Promise<void> {
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
        this.emitStatusUpdate(env.workspaceId, EnvironmentStatus.RUNNING, env.startedAt);
      } else {
        if (env.status !== EnvironmentStatus.STOPPED) {
          env.status = EnvironmentStatus.STOPPED;
          env.startedAt = null;
          await this.environmentRepository.save(env);
        }
        this.emitStatusUpdate(env.workspaceId, EnvironmentStatus.STOPPED, null);
      }
    } catch (err) {
      this.logger.error({ workspaceId: env.workspaceId, err }, 'Failed to check Jupyter status');
    }
  }

  async bindWorkspace(workspaceId: string): Promise<void> {
    if (this.kernelManagers.has(workspaceId)) return;

    const serverSettings = await this.getServerSettings();
    const kernelManager = new services.KernelManager({ serverSettings });
    const sessionManager = new services.SessionManager({ kernelManager, serverSettings });

    this.kernelManagers.set(workspaceId, kernelManager);
    this.sessionManagers.set(workspaceId, sessionManager);
    this.getExtension(workspaceId);
  }

  async stop(workspaceId: string): Promise<void> {
    this.sessionManagers.get(workspaceId)?.dispose();
    this.kernelManagers.get(workspaceId)?.dispose();
    this.sessionManagers.delete(workspaceId);
    this.kernelManagers.delete(workspaceId);
    this.jupyterExtensions.delete(workspaceId);
  }

  async restart(workspaceId: string): Promise<void> {
    this.logger.log(`Restarting Jupyter kernel for workspace ${workspaceId}`);
    await this.stop(workspaceId);
    const kernelId = await this.getActiveKernelId(workspaceId);
    if (kernelId) {
      await fetch(`${this.getBaseURL()}/api/kernels/${kernelId}/restart`, {
        method: 'POST',
        headers: { Authorization: `token ${this.token}` },
      });
    }
    await this.bindWorkspace(workspaceId);
  }

  async ensureRunning(workspaceId: string): Promise<void> {
    if (!this.kernelManagers.has(workspaceId)) {
      await this.bindWorkspace(workspaceId);
    }
  }

  async isRunning(workspaceId: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.getBaseURL()}/api/status`, {
        headers: { Authorization: `token ${this.token}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async setEnvironmentVariables(workspaceId: string, variables: EnvironmentVariables): Promise<void> {
    const ext = this.getExtension(workspaceId);
    // await ext.setEnvironmentVariables(variables);
  }

  async getEnvironmentStatus(workspaceId: string): Promise<{ status: string; startedAt: Date | null }> {
    const env = await this.environmentRepository.findOne({ where: { workspaceId } });
    return {
      status: env?.status ?? EnvironmentStatus.STOPPED,
      startedAt: env?.startedAt ?? null,
    };
  }

  async fileExists(workspaceId: string, fileName: string): Promise<boolean> {
    const result = await this.getExtension(workspaceId).statFile(
      await this.getFilepath(workspaceId, fileName)
    );
    if (result._tag === 'error') {
      if (result.reason === 'not-found') return false;
      throw new Error(`Failed to stat file: ${result.reason}`);
    }
    return true;
  }

  async getFile(workspaceId: string, fileName: string): Promise<GetFileResult | null> {
    const result = await this.getExtension(workspaceId).readFile(
      await this.getFilepath(workspaceId, fileName)
    );
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

  async putFile(
    workspaceId: string,
    fileName: string,
    replace: boolean,
    file: Readable,
  ): Promise<'success' | 'already-exists'> {
    const ext = this.getExtension(workspaceId);
    const filePath = await this.getFilepath(workspaceId, fileName);
    const statResult = await ext.statFile(filePath);

    if (statResult._tag === 'error' && statResult.reason !== 'not-found') {
      throw new Error(`Failed to stat file: ${statResult.reason}`);
    }
    if (statResult._tag === 'success' && !replace) return 'already-exists';

    const result = await ext.writeFile(filePath, file);
    if (result._tag === 'error') throw new Error(`Failed to write file: ${result.reason}`);
    return 'success';
  }

  async deleteFile(workspaceId: string, fileName: string): Promise<void> {
    const result = await this.getExtension(workspaceId).deleteFile(
      await this.getFilepath(workspaceId, fileName)
    );
    if (result._tag === 'error' && result.reason !== 'not-found') {
      throw new Error(`Failed to delete file: ${result.reason}`);
    }
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

  // ─── Private helpers ──────────────────────────────────────────────────────

  private getBaseURL(): string {
    return `${this.protocol}://${this.host}:${this.port}`;
  }

  private getExtension(workspaceId: string): SandwormJupyterExtension {
    if (!this.jupyterExtensions.has(workspaceId)) {
      this.jupyterExtensions.set(
        workspaceId,
        new SandwormJupyterExtension(this.protocol, this.host, this.port, this.token),
      );
    }
    return this.jupyterExtensions.get(workspaceId)!;
  }

  async getServerSettings(): Promise<services.ServerConnection.ISettings> {
    const wsUrl = this.getBaseURL().replace(
      this.protocol,
      this.protocol === 'https' ? 'wss' : 'ws',
    );
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

  private async getFilepath(workspaceId: string, fileName: string): Promise<string> {
    const cwd = await this.getExtension(workspaceId).getCWD();
    return path.join(cwd, path.join('/', fileName));
  }

  private async getActiveKernelId(workspaceId: string): Promise<string | null> {
    try {
      const res = await fetch(`${this.getBaseURL()}/api/kernels`, {
        headers: { Authorization: `token ${this.token}` },
      });
      if (!res.ok) return null;
      const kernels: Array<{ id: string }> = await res.json();
      return kernels[0]?.id ?? null;
    } catch {
      return null;
    }
  }

  private emitStatusUpdate(
    workspaceId: string,
    status: EnvironmentStatus,
    startedAt: Date | null,
  ): void {
    this.eventEmitter.emit(
      EventNames.ENVIRONMENT_STATUS_UPDATE,
      new EnvironmentStatusEvent(
        workspaceId,
        status,
        status === EnvironmentStatus.RUNNING ? (startedAt?.toISOString() ?? null) : null,
      ),
    );
  }

  deploy(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}