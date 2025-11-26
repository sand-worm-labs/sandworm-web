import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';
import { FileService } from './file.service';
import { SandwormFile } from './model/file.model';
import {
  ListFilesInput,
  GetFileInput,
  DeleteFileInput,
} from './dto/file.dto';

@Resolver(() => SandwormFile)
export class FileResolver {
  constructor(private readonly fileService: FileService) {}

  @Query(() => [SandwormFile], {
    name: 'listFiles',
    description: 'List all files in a workspace',
  })
  async listFiles(@Args('input') input: ListFilesInput): Promise<SandwormFile[]> {
    return this.fileService.listFiles(input);
  }

  @Query(() => Boolean, {
    name: 'fileExists',
    description: 'Check if a file exists',
  })
  async fileExists(
    @Args('workspaceId') workspaceId: string,
    @Args('fileName') fileName: string,
  ): Promise<boolean> {
    return this.fileService.fileExists(workspaceId, fileName);
  }

  @Mutation(() => Boolean, {
    name: 'deleteFile',
    description: 'Delete a file from the workspace',
  })
  async deleteFile(
    @Args('input') input: DeleteFileInput,
    @CurrentUser('id') userId: string,
  ): Promise<boolean> {
    return this.fileService.deleteFile(input);
  }

  // Note: File upload and download would typically be handled via REST endpoints
  // due to multipart/form-data and streaming requirements
  // See apps/api/src/v1/workspaces/workspace/files.ts for REST implementation
}