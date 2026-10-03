import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class AuthGithubLoginDto {
  @ApiProperty({ example: 'abc' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ required: false, description: 'Required to create a new account' })
  @IsOptional()
  @IsString()
  referralCode?: string;
}
