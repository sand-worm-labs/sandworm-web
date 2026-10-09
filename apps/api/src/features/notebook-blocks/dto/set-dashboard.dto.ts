import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, ValidateNested } from 'class-validator';
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

  @ApiPropertyOptional({
    enum: ['card', 'plain'],
    description: 'card (default): the dashboard border, surface and title. plain: the cell\'s own output with no card or title, for content that owns its look',
  })
  @IsOptional()
  @IsIn(['card', 'plain'])
  chrome?: 'card' | 'plain';

  @ApiPropertyOptional({
    description: 'true: hide this cell from the published report so it shows on the dashboard only. false: show it in the report again. Left out: unchanged',
  })
  @IsOptional()
  @IsBoolean()
  dashboardOnly?: boolean;
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

  @ApiPropertyOptional({
    enum: ['left', 'center', 'right'],
    description: 'Where tiles sit when their widths add up to less than the full row. Without it a row must fill all the columns',
  })
  @IsOptional()
  @IsIn(['left', 'center', 'right'])
  align?: 'left' | 'center' | 'right';

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
