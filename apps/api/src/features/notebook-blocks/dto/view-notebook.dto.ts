import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { MAX_RUN_WAIT_SECONDS } from './run-notebook.dto';

export class ViewNotebookDto {
  @ApiPropertyOptional({ description: 'Wait up to this long for anything still running to finish before answering' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(MAX_RUN_WAIT_SECONDS)
  waitSeconds?: number;
}
