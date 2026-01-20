import { Injectable, Logger } from '@nestjs/common';
import { SandwormFile } from './model/file.model';
import {
  ListFilesInput,
  DeleteFileInput,
} from './dto/file.dto';
import { JupyterService } from '@/infrastructure/jupyter/jupyter.service';
import { Readable } from 'stream';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(private readonly jupyterService: JupyterService) { }

  /**
   * List all files in workspace
   */
  async listFiles(input: ListFilesInput): Promise<SandwormFile[]> {
    const { workspaceId, path } = input;
    this.logger.log(`Listing files for workspace ${workspaceId}`);

    const files = await this.jupyterService.listFiles(workspaceId);
    return files;
  }

  /**
   * Get file for download
   */
  async getFile(
    workspaceId: string,
    filePath: string,
  ): Promise<{
    stream: Readable;
    size: number;
    exitCode: Promise<number>;
  } | null> {
    this.logger.log(`Getting file ${filePath} from workspace ${workspaceId}`);

    await this.jupyterService.ensureRunning(workspaceId);

    const result = await this.jupyterService.getFile(workspaceId, filePath);

    if (!result) {
      return null;
    }

    return {
      stream: result.stream,
      size: result.size,
      exitCode: result.exitCode,
    };
  }

  /**
   * Upload file to workspace
   */
  async uploadFile(
    workspaceId: string,
    fileName: string,
    replace: boolean,
    fileStream: Readable,
  ): Promise<boolean> {
    this.logger.log(`Uploading file ${fileName} to workspace ${workspaceId}`);

    await this.jupyterService.ensureRunning(workspaceId);

    this.logger.log(`Jupyter server is running for workspace ${workspaceId}`);

    // Check if file exists when replace is false
    if (!replace) {
      const fileExists = await this.jupyterService.fileExists(
        workspaceId,
        fileName,
      );
      if (fileExists) {
        throw new Error('File already exists');
      }
    }

    this.logger.log(
      `Uploading file ${fileName} to Jupyter server for workspace ${workspaceId}`,
    );

    const result = await this.jupyterService.putFile(
      workspaceId,
      fileName,
      replace,
      fileStream,
    );

    if (result === 'already-exists') {
      throw new Error('File already exists');
    }

    return true;
  }

  /**
   * Delete file from workspace
   */
  async deleteFile(input: DeleteFileInput): Promise<boolean> {
    const { workspaceId, path } = input;
    this.logger.log(`Deleting file ${path} from workspace ${workspaceId}`);

    await this.jupyterService.ensureRunning(workspaceId);
    await this.jupyterService.deleteFile(workspaceId, path);

    return true;
  }

  /**
   * Check if file exists
   */
  async fileExists(workspaceId: string, fileName: string): Promise<boolean> {
    await this.jupyterService.ensureRunning(workspaceId);
    return await this.jupyterService.fileExists(workspaceId, fileName);
  }
}