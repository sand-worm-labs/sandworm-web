import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Y from 'yjs';
import {
  ExecutionQueueItem,
  getSQLAttributes,
  SQLBlock,
  ExecutionQueueItemSQLMetadata,
} from '@sandworm/editor';
import { WorkspaceEntity, DataSourceEntity } from '@sandworm/postgresql-typeorm';
import { DataframeService } from '../dataframe.service';

export interface ExecutionContext {
  sessionId: string;
  workspaceId: string;
  documentId: string;
  userId: string;
}

@Injectable()
export class SqlBlockExecutorService {
  private readonly logger = new Logger(SqlBlockExecutorService.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepo: Repository<WorkspaceEntity>,
    @InjectRepository(DataSourceEntity)
    private readonly dataSourceRepo: Repository<DataSourceEntity>,
    private readonly dataframeService: DataframeService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async run(
    executionItem: ExecutionQueueItem,
    block: Y.XmlElement<SQLBlock>,
    metadata: ExecutionQueueItemSQLMetadata,
    context: ExecutionContext,
  ): Promise<void> {
    block.setAttribute('result', null);
    block.setAttribute('resultError', null);

    try {
      const blockId = block.getAttribute('id');
      block.setAttribute('startQueryTime', new Date().toISOString());
      
      this.logger.debug(`Executing SQL block ${blockId}`);

      const attrs = getSQLAttributes(block);
      const { source, dataSourceId } = attrs;
      const query = source?.toJSON() ?? '';

      if (!query.trim()) {
        throw new Error('SQL query is empty');
      }

      // Get data source
      const dataSource = await this.dataSourceRepo.findOne({
        where: { id: dataSourceId, workspaceId: context.workspaceId },
      });

      if (!dataSource) {
        throw new Error(`Data source ${dataSourceId} not found`);
      }

      // Execute SQL query
      // TODO: Implement actual SQL execution based on data source type
      const result = await this.executeQuery(dataSource, query, context);

      // Store results in block
      block.setAttribute('result', result.rows);
      block.setAttribute('resultColumns', result.columns);
      block.setAttribute('resultCount', result.count);
      block.setAttribute('lastQuery', query);
      block.setAttribute('lastQueryTime', new Date().toISOString());

      // Create dataframe from results
      const dataframeName = attrs.dataframeName || `sql_${blockId}`;
      const dataframe = {
        name: dataframeName,
        columns: result.columns,
        rowCount: result.count,
        blockId,
      };

      // Update dataframes map
      const dataframes = block.doc?.getMap('dataframes');
      if (dataframes) {
        dataframes.set(dataframeName, dataframe);
      }

      this.logger.debug(`SQL block ${blockId} executed successfully`);
      executionItem.setCompleted('success');

      // Emit event
      this.eventEmitter.emit('sql.executed', {
        workspaceId: context.workspaceId,
        documentId: context.documentId,
        blockId,
        userId: context.userId,
        rowCount: result.count,
      });
    } catch (err) {
      this.logger.error(
        `Error executing SQL block ${block.getAttribute('id')}:`,
        err
      );
      block.setAttribute('resultError', err.message);
      executionItem.setCompleted('error');
    }
  }

  async loadPage(
    executionItem: ExecutionQueueItem,
    block: Y.XmlElement<SQLBlock>,
    page: number,
    context: ExecutionContext,
  ): Promise<void> {
    try {
      const blockId = block.getAttribute('id');
      this.logger.debug(`Loading page ${page} for SQL block ${blockId}`);

      // Update page attribute
      block.setAttribute('page', page);

      // TODO: Implement pagination logic
      // This might re-query with LIMIT/OFFSET or load from cached results

      executionItem.setCompleted('success');
    } catch (err) {
      this.logger.error(`Error loading page for SQL block:`, err);
      executionItem.setCompleted('error');
    }
  }

  private async executeQuery(
    dataSource: DataSourceEntity,
    query: string,
    context: ExecutionContext,
  ): Promise<{ rows: any[]; columns: any[]; count: number }> {
    // TODO: Implement based on dataSource.type
    // - PostgreSQL
    // - MySQL
    // - BigQuery
    // - Snowflake
    // etc.

    throw new Error('SQL execution not yet implemented');
  }
}