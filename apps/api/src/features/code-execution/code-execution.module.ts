import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity, EnvironmentVariableEntity } from '@sandworm/postgresql-typeorm';
import { JupyterSessionService } from './jupyter-session/jupyter-session.service';
import { KernelLifecycleService } from './jupyter-session/kernel-lifecycle.service';
import { JupyterCompletionService } from './jupyter-session/jupyter-completion.service';
import { PythonExecutorService } from './python-executor.service';
import { DataFrameService } from './query-engine/dataframe/dataframe.service';
import { DuckDBQueryService } from './query-engine/duckdb/duckdb-query.service';
import { PythonQueryRunnerService } from './query-engine/python/python-query-runner.service';
import { QueryExecutionService } from './query-engine/query-execution.service';
import { VisualizationService } from './visualization/visualization.service';
import { PivotTableService } from './pivot-table/pivot-table.service';
import { VariableService } from './variable.service';
import { JupyterModule } from '@/infrastructure/jupyter/jupyter.module';
import { PythonCompletionService } from './python-completion.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EnvironmentVariableEntity, DocumentEntity]),
    JupyterModule
  ],
  providers: [
      JupyterSessionService,
      KernelLifecycleService,
      JupyterCompletionService, 
      PythonExecutorService,
      DataFrameService,
      DuckDBQueryService,
      PythonQueryRunnerService,
      QueryExecutionService,
      VisualizationService,
      PivotTableService,
      VariableService,
  ],
  exports: [
      JupyterSessionService,
      JupyterCompletionService,  
      PythonExecutorService,
      QueryExecutionService,
      DataFrameService,
      VisualizationService,
      PivotTableService,
      VariableService,
  ],
})
export class CodeExecutionModule { }