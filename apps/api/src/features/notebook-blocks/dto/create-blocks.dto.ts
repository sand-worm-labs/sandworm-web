import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { BLOCK_KINDS, type BlockKind } from '../blocks/block-definition';

const MAX_SOURCE_LENGTH = 100_000;
const MAX_BLOCKS_PER_REQUEST = 50;

export class CreateBlockDto {
  @ApiProperty({ enum: BLOCK_KINDS })
  @IsIn(BLOCK_KINDS)
  kind: BlockKind;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description:
      'Cell text: SQL, Python, Markdown or rich text. For inputs, the default value (dropdown: one option per line; date: YYYY/MM/DD)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_SOURCE_LENGTH)
  source?: string;

  @ApiPropertyOptional({ description: 'SQL only: dune, duckdb or sandworm_cloud' })
  @IsOptional()
  @IsString()
  dataSource?: string;

  @ApiPropertyOptional({
    description: 'SQL: name the result is stored under. Visualization and pivot table: the dataframe to read from',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  dataframeName?: string;

  @ApiPropertyOptional({ description: 'Power toolbox only: id of a tool from the catalog' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  toolId?: string;

  @ApiPropertyOptional({ description: "Power toolbox only: values for the tool's inputs, keyed by input key" })
  @IsOptional()
  @IsObject()
  inputs?: Record<string, string | number | boolean | string[]>;
}

export class CreateBlocksDto {
  @ApiProperty({ type: [CreateBlockDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_BLOCKS_PER_REQUEST)
  @ValidateNested({ each: true })
  @Type(() => CreateBlockDto)
  blocks: CreateBlockDto[];

  @ApiPropertyOptional({ description: 'Index to insert at; appends when omitted' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000)
  position?: number;
}
