import { Global, Module } from '@nestjs/common';
import { CodeExecutionModule } from '@/features/code-execution/code-execution.module';
import { DuneDataSourceService } from './dune-datasource.service';

@Global()
@Module({
    imports: [CodeExecutionModule],
    providers: [DuneDataSourceService],
    exports: [DuneDataSourceService],
})
export class DuneModule { }
