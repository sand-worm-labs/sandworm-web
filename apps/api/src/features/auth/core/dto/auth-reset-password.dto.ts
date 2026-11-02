import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class AuthResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(256)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  hash: string;
}
