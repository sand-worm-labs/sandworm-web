import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { MAX_RUN_BLOCKS, MAX_RUN_WAIT_SECONDS } from './run-notebook.dto';

export class RunResultsQueryDto {
  @ApiPropertyOptional({ type: String, description: 'Comma-separated cell ids to report on. Reports every runnable cell when omitted' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',').map(id => id.trim()).filter(Boolean) : value))
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_RUN_BLOCKS)
  @IsUUID(undefined, { each: true })
  blockIds?: string[];

  @ApiPropertyOptional({ description: 'Wait up to this long for anything still running to finish before answering' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(MAX_RUN_WAIT_SECONDS)
  waitSeconds?: number;
}
