import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { DASHBOARD_COLUMNS, MAX_ROW_HEIGHT, MAX_TILES_PER_ROW } from '@sandworm/editor';

const MAX_ROWS = 60;
const MAX_HEADING_LENGTH = 120;

export class DashboardTileDto {
  @ApiProperty({ description: 'ID of the cell to show' })
  @IsUUID()
  cellId: string;

  @ApiPropertyOptional({
    description: `Width in columns of the ${DASHBOARD_COLUMNS}-column grid. A row's widths add up to ${DASHBOARD_COLUMNS}; leave them all out to split the row evenly`,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(DASHBOARD_COLUMNS)
  width?: number;
}

export class DashboardRowDto {
  @ApiPropertyOptional({ description: 'A section title, drawn full width above the tiles' })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_HEADING_LENGTH)
  heading?: string;

  @ApiPropertyOptional({ description: 'Height in grid rows, shared by every tile in the row. Defaults from what the row holds' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_ROW_HEIGHT)
  height?: number;

  @ApiPropertyOptional({ type: [DashboardTileDto], description: 'Tiles, left to right' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_TILES_PER_ROW)
  @ValidateNested({ each: true })
  @Type(() => DashboardTileDto)
  tiles?: DashboardTileDto[];
}

export class SetDashboardDto {
  @ApiProperty({ type: [DashboardRowDto], description: 'Rows, top to bottom. An empty list clears the dashboard' })
  @IsArray()
  @ArrayMaxSize(MAX_ROWS)
  @ValidateNested({ each: true })
  @Type(() => DashboardRowDto)
  rows: DashboardRowDto[];
}
