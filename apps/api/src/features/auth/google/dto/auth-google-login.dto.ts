import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AuthGoogleLoginDto {
  @ApiProperty({ example: 'abc' })
  @IsNotEmpty()
  code: string;

  @ApiProperty({ required: false, description: 'Required to create a new account' })
  @IsOptional()
  @IsString()
  referralCode?: string;
}
