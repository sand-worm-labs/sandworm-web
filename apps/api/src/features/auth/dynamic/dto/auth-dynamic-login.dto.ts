import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AuthDynamicLoginDto {
  @ApiProperty({
    description:
      'The JWT Dynamic gave the browser after sign-in (wallet or email)',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(8000)
  token: string;
}
