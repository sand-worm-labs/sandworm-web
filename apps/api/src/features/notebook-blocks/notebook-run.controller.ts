import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiAuth, CurrentUser } from '@sandworm/api';
import { NoAudit } from '@/features/audit/audit.decorators';
import { RunNotebookDto } from './dto/run-notebook.dto';
import { RunResultsQueryDto } from './dto/run-results-query.dto';
import { ViewNotebookDto } from './dto/view-notebook.dto';
import { NotebookRunService } from './notebook-run.service';

@ApiTags('Notebook runs')
@Controller({
  path: 'workspaces/:workspaceId/documents/:documentId/run',
  version: '1',
})
export class NotebookRunController {
  constructor(private readonly runs: NotebookRunService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiAuth({ summary: 'Run a notebook, or some of its cells' })
  start(
    @CurrentUser('id') userId: string,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Body() dto: RunNotebookDto,
  ) {
    return this.runs.start({ userId, workspaceId, documentId }, dto);
  }

  // Polled while a run is in progress, which would flood the audit log.
  @NoAudit()
  @Get()
  @ApiAuth({ summary: "Get a notebook's execution state and the latest result of each cell" })
  results(
    @CurrentUser('id') userId: string,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Query() query: RunResultsQueryDto,
  ) {
    return this.runs.results({ userId, workspaceId, documentId }, query);
  }
}

// What the notebook's view page talks to: plain requests, no collaboration socket.
@ApiTags('Notebook runs')
@Controller({
  path: 'workspaces/:workspaceId/documents/:documentId/view',
  version: '1',
})
export class NotebookViewController {
  constructor(private readonly runs: NotebookRunService) {}

  // Polled while a run is in progress, which would flood the audit log.
  @NoAudit()
  @Get()
  @ApiAuth({ summary: "Get the caller's copy of a published notebook, with its latest results" })
  view(
    @CurrentUser('id') userId: string,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Query() query: ViewNotebookDto,
  ) {
    return this.runs.view({ userId, workspaceId, documentId }, query);
  }

  @Post('run')
  @HttpCode(HttpStatus.OK)
  @ApiAuth({ summary: "Run the caller's copy of a published notebook again" })
  rerun(
    @CurrentUser('id') userId: string,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Body() dto: ViewNotebookDto,
  ) {
    return this.runs.rerunView({ userId, workspaceId, documentId }, dto);
  }
}
