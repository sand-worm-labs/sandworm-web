import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
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

  @ApiPropertyOptional({ description: 'SQL, Python or Markdown text' })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_SOURCE_LENGTH)
  source?: string;

  @ApiPropertyOptional({ description: 'SQL only: dune, duckdb or sandworm_cloud' })
  @IsOptional()
  @IsString()
  dataSource?: string;

  @ApiPropertyOptional({ description: 'SQL only: name of the dataframe the result is stored in' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  dataframeName?: string;
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
