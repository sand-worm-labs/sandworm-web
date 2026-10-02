import { Body, Controller, Delete, Param, ParseUUIDPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiAuth, CurrentUser } from '@sandworm/api';
import { NotebookBlocksService } from './notebook-blocks.service';
import { CreateBlocksDto } from './dto/create-blocks.dto';
import { DeleteBlockQueryDto } from './dto/delete-block-query.dto';
import { SetTitleDto } from './dto/set-title.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { NoAudit } from '@/features/audit/audit.decorators';

// Cell and title edits are high-volume and would flood the audit log, so they
// opt out one by one. Deleting a cell is neither, and stays audited.
@ApiTags('Notebook blocks')
@Controller({
  path: 'workspaces/:workspaceId/documents/:documentId',
  version: '1',
})
export class NotebookBlocksController {
  constructor(private readonly notebookBlocks: NotebookBlocksService) {}

  @NoAudit()
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

  @NoAudit()
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

  @NoAudit()
  @Patch('blocks/:blockId')
  @ApiAuth({ summary: 'Change a block of a notebook' })
  async updateBlock(
    @CurrentUser('id') userId: string,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Param('blockId', ParseUUIDPipe) blockId: string,
    @Body() dto: UpdateBlockDto,
  ) {
    const block = await this.notebookBlocks.updateBlock({ userId, workspaceId, documentId }, blockId, dto);
    return { block };
  }

  @Delete('blocks/:blockId')
  @ApiAuth({ summary: 'Delete a block from a notebook' })
  async deleteBlock(
    @CurrentUser('id') userId: string,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Param('blockId', ParseUUIDPipe) blockId: string,
    @Query() { removeFromDashboard = false }: DeleteBlockQueryDto,
  ) {
    await this.notebookBlocks.deleteBlock({ userId, workspaceId, documentId }, blockId, removeFromDashboard);
    return { deleted: blockId };
  }
}
