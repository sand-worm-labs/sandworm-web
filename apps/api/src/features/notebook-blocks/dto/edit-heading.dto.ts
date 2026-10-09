import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

const MAX_HEADING_LENGTH = 120;

export class EditHeadingDto {
  @ApiProperty({ description: 'The new text of the heading' })
  @IsString()
  @MaxLength(MAX_HEADING_LENGTH)
  content: string;
}
