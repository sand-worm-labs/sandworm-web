import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { MAX_PAGE_SIZE, MAX_QUERY_LENGTH } from '../search.constants';
import { SEARCH_ENTRY_TYPES, type SearchEntryType } from '../search.types';

export class SearchQueryDto {
  @ApiPropertyOptional({
    description:
      'What to search for. Empty returns the popular entries of each kind.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_QUERY_LENGTH)
  q?: string;

  @ApiPropertyOptional({
    enum: SEARCH_ENTRY_TYPES,
    description: 'Only this kind, one page of it.',
  })
  @IsOptional()
  @IsIn(SEARCH_ENTRY_TYPES)
  type?: SearchEntryType;

  @ApiPropertyOptional({ minimum: 1, maximum: MAX_PAGE_SIZE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit?: number;

  @ApiPropertyOptional({
    minimum: 0,
    description: 'Skip this many results. Only with `type`.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
