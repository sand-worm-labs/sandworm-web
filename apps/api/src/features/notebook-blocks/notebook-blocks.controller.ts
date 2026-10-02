import { Body, Controller, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiAuth, CurrentUser } from '@sandworm/api';
import { NotebookBlocksService } from './notebook-blocks.service';
import { CreateBlocksDto } from './dto/create-blocks.dto';
import { SetTitleDto } from './dto/set-title.dto';

@ApiTags('Notebook blocks')
@Controller({
  path: 'workspaces/:workspaceId/documents/:documentId',
  version: '1',
})
export class NotebookBlocksController {
  constructor(private readonly notebookBlocks: NotebookBlocksService) {}

  @Post('blocks')
  @ApiAuth({ summary: 'Add blocks to a notebook' })
  async createBlocks(
    @CurrentUser('id') userId: string,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Body() dto: CreateBlocksDto,
  ) {
    const blocks = await this.notebookBlocks.createBlocks({ userId, workspaceId, documentId }, dto);
    return { blocks };
  }

  @Put('title')
  @ApiAuth({ summary: 'Set the title of a notebook' })
  async setTitle(
    @CurrentUser('id') userId: string,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Body() { title }: SetTitleDto,
  ) {
    await this.notebookBlocks.setTitle({ userId, workspaceId, documentId }, title);
    return { title };
  }
}
