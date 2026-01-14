import { Args, Query, Mutation, Resolver } from '@nestjs/graphql';
import { FileService } from './file.service';
import { ListFilesInput, DeleteFileInput } from './dto/file.dto';
import { SandwormFile } from './model/file.model';

@Resolver(() => SandwormFile)
export class FileResolver {
  constructor(private readonly fileService: FileService) { }

  @Query(() => [SandwormFile], {
    name: 'listFiles',
    description: 'List all files in a workspace',
  })
  async listFiles(
    @Args('input', { type: () => ListFilesInput }) input: ListFilesInput,
  ): Promise<SandwormFile[]> {
    return this.fileService.listFiles({ workspaceId: input.workspaceId, path: input.path })
  }

  @Query(() => Boolean, {
    name: 'fileExists',
    description: 'Check if a file exists',
  })
  async fileExists(
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @Args('fileName', { type: () => String }) fileName: string,
  ): Promise<boolean> {
    return this.fileService.fileExists(workspaceId, fileName);
  }

  @Mutation(() => Boolean, {
    name: 'deleteFile',
    description: 'Delete a file from the workspace',
  })
  async deleteFile(
    @Args('input', { type: () => DeleteFileInput }) input: DeleteFileInput,
  ): Promise<boolean> {
    await this.fileService.deleteFile({ workspaceId: input.workspaceId, path: input.path });
    return true;
  }
}