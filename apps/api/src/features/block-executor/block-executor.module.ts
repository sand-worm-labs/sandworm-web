import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import blockExecutorConfig from './config/block-executor.config';
import { DataframeService } from './services/block-executor-dataframe.service';
import { PythonBlockExecutorService } from './services/executors/python-block-executor.service';
import { SqlBlockExecutorService } from './services/executors/sql-block-executor.service';
import { InputBlockExecutorService } from './services/executors/input-block-executor.service';
import { DateInputBlockExecutorService } from './services/executors/date-input-block-executor.service';
import { DropdownInputBlockExecutorService } from './services/executors/dropdown-input-block-executor.service';
import { PivotTableBlockExecutorService } from './services/executors/pivot-table-block-executor.service';
import { VisualizationBlockExecutorService } from './services/executors/visualization-block-executor.service';
import { WritebackBlockExecutorService } from './services/executors/writeback-block-executor.service';

const executorServices = [
    PythonBlockExecutorService,
    SqlBlockExecutorService,
    InputBlockExecutorService,
    DateInputBlockExecutorService,
    DropdownInputBlockExecutorService,
    PivotTableBlockExecutorService,
    VisualizationBlockExecutorService,
    WritebackBlockExecutorService,
];

@Module({
    imports: [
        EventEmitterModule.forRoot(),
        ConfigModule.forFeature(blockExecutorConfig),
    ],
    providers: [
        DataframeService,
        ...executorServices,
    ],
    exports: [
        DataframeService,
        ...executorServices,
    ],
})
export class BlockExecutorModule { }