import { Injectable } from '@nestjs/common';
import * as Y from 'yjs';
import { LockService } from '@/infrastructure/lock/lock.services';
import { PythonBlockExecutorService } from '@/features/block-executor/services/executors/python-block-executor.service';
import { SqlBlockExecutorService } from '@/features/block-executor/services/executors/sql-block-executor.service';
import { VisualizationBlockExecutorService } from '@/features/block-executor/services/executors/visualization-block-executor.service';
import { InputBlockExecutorService } from '@/features/block-executor/services/executors/input-block-executor.service';
import { DateInputBlockExecutorService } from '@/features/block-executor/services/executors/date-input-block-executor.service';
import { DropdownInputBlockExecutorService } from '@/features/block-executor/services/executors/dropdown-input-block-executor.service';
import { PivotTableBlockExecutorService } from '@/features/block-executor/services/executors/pivot-table-block-executor.service';
import { PowerToolboxBlockExecutorService } from '@/features/block-executor/services/executors/power-toolbox-block-executor.service';
import { DocExecutor } from './doc-executor';

@Injectable()
export class DocumentExecutorService {
  constructor(
    private readonly python: PythonBlockExecutorService,
    private readonly sql: SqlBlockExecutorService,
    private readonly visualization: VisualizationBlockExecutorService,
    private readonly input: InputBlockExecutorService,
    private readonly dateInput: DateInputBlockExecutorService,
    private readonly dropdownInput: DropdownInputBlockExecutorService,
    private readonly pivotTable: PivotTableBlockExecutorService,
    private readonly powerToolbox: PowerToolboxBlockExecutorService,
    private readonly lock: LockService,
  ) {}

  createExecutor(
    docId: string,
    workspaceId: string,
    documentId: string,
    ydoc: Y.Doc,
    blocks: Y.Map<any>,
    dataframes: Y.Map<any>,
  ): DocExecutor {
    return new DocExecutor(
      docId,
      workspaceId,
      documentId,
      ydoc,
      blocks,
      dataframes,
      {
        python: this.python,
        sql: this.sql,
        visualization: this.visualization,
        input: this.input,
        dateInput: this.dateInput,
        dropdownInput: this.dropdownInput,
        pivotTable: this.pivotTable,
        powerToolbox: this.powerToolbox,
        lock: this.lock,
      },
    );
  }
}