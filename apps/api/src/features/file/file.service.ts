import { Injectable, Logger } from '@nestjs/common';
import { ValidationException } from '@sandworm/graphql';
import { ErrorCode } from '@/constants/error-code.constant';
import { SandwormFile } from './model/file.model';
import {
  ListFilesInput,
  GetFileInput,
  DeleteFileInput,
} from './dto/file.dto';
import { JupyterService } from '@/infrastructure/jupyter/jupyter.service';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(private readonly jupyterService: JupyterService) { }

  async listFiles(input: ListFilesInput): Promise<SandwormFile[]> {
    const { workspaceId, path } = input;

    this.logger.log(`Listing files for workspace ${workspaceId}`);

    const files = await this.jupyterService.listFiles(workspaceId);
    return files;
  }

  async getFile(input: GetFileInput): Promise<{
    stream: NodeJS.ReadableStream;
    size: number;
    exitCode: Promise<number>;
  } | null> {
    const { workspaceId, path } = input;

    this.logger.log(`Getting file ${path} for workspace ${workspaceId}`);

    await this.jupyterService.ensureRunning(workspaceId);
    const file = await this.jupyterService.getFile(workspaceId, path);

    if (!file) {
      throw new ValidationException(ErrorCode.E404, 'File not found');
    }

    return file;
  }

  async uploadFile(
    workspaceId: string,
    fileName: string,
    replace: boolean,
    fileStream: any,
  ): Promise<boolean> {
    this.logger.log(
      `Uploading file ${fileName} to workspace ${workspaceId}`,
    );

    await this.jupyterService.ensureRunning(workspaceId);

    if (!replace) {
      const fileExists = await this.jupyterService.fileExists(
        workspaceId,
        fileName,
      );

      if (fileExists) {
        throw new ValidationException(
          ErrorCode.E006,
          'File already exists',
        );
      }
    }

    const result = await this.jupyterService.putFile(
      workspaceId,
      fileName,
      replace,
      fileStream,
    );

    if (result === 'already-exists') {
      throw new ValidationException(ErrorCode.E006, 'File already exists');
    }

    return true;
  }

  async deleteFile(input: DeleteFileInput): Promise<boolean> {
    const { workspaceId, path } = input;

    this.logger.log(`Deleting file ${path} from workspace ${workspaceId}`);

    await this.jupyterService.ensureRunning(workspaceId);
    await this.jupyterService.deleteFile(workspaceId, path);
    return true;
  }

  async fileExists(workspaceId: string, fileName: string): Promise<boolean> {
    await this.jupyterService.ensureRunning(workspaceId);
    return await this.jupyterService.fileExists(workspaceId, fileName);
  }
}