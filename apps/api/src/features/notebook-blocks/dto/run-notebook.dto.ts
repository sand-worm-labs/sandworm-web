import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

// Kept under a minute so the response beats the request timeout most HTTP and
// MCP clients apply; a longer run is followed with the results endpoint.
export const MAX_RUN_WAIT_SECONDS = 50;
export const MAX_RUN_BLOCKS = 200;

export class RunNotebookDto {
  @ApiPropertyOptional({ type: [String], description: 'Run only these cells, in notebook order. Runs every cell when omitted' })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_RUN_BLOCKS)
  @IsUUID(undefined, { each: true })
  blockIds?: string[];

  @ApiPropertyOptional({ description: 'How long to wait for the run before answering. The run continues either way' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_RUN_WAIT_SECONDS)
  waitSeconds?: number;
}
