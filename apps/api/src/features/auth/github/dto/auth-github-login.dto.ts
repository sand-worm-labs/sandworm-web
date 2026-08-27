import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthGithubLoginDto {
  @ApiProperty({ example: 'abc' })
  @IsNotEmpty()
  @IsString()
  code: string;
}