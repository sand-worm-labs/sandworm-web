import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthGithubLoginDto {
  @ApiProperty({ example: 'gho_xxxxxxxxxxxx' })
  @IsNotEmpty()
  @IsString()
  accessToken: string;
}