import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class DeleteBlockQueryDto {
  @ApiPropertyOptional({ description: 'Also remove the block from the dashboard, if it is shown there' })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsBoolean()
  removeFromDashboard?: boolean;
}
