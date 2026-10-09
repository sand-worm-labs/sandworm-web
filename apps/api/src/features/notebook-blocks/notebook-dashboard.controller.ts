import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiAuth, CurrentUser } from '@sandworm/api';
import { NoAudit } from '@/features/audit/audit.decorators';
import { EditHeadingDto } from './dto/edit-heading.dto';
import { SetDashboardDto } from './dto/set-dashboard.dto';
import { NotebookDashboardService } from './notebook-dashboard.service';

// Laying out a dashboard is an edit like the cell edits in the blocks
// controller, so it opts out of the audit log the same way.
@ApiTags('Notebook dashboard')
@Controller({
  path: 'workspaces/:workspaceId/documents/:documentId/dashboard',
  version: '1',
})
export class NotebookDashboardController {
  constructor(private readonly dashboard: NotebookDashboardService) {}

  @Get()
  @ApiAuth({ summary: "Read a notebook's dashboard layout" })
  getDashboard(
    @CurrentUser('id') userId: string,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
  ) {
    return this.dashboard.getDashboard({ userId, workspaceId, documentId });
  }

  @NoAudit()
  @Put()
  @ApiAuth({ summary: "Replace a notebook's dashboard layout" })
  setDashboard(
    @CurrentUser('id') userId: string,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Body() dto: SetDashboardDto,
  ) {
    return this.dashboard.setDashboard({ userId, workspaceId, documentId }, dto);
  }

  @NoAudit()
  @Patch('headings/:headingId')
  @ApiAuth({ summary: "Change the text of one of a notebook's dashboard headings" })
  editHeading(
    @CurrentUser('id') userId: string,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Param('headingId', ParseUUIDPipe) headingId: string,
    @Body() dto: EditHeadingDto,
  ) {
    return this.dashboard.editHeading({ userId, workspaceId, documentId }, headingId, dto);
  }
}
