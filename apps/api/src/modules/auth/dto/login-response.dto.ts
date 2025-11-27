import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from '../../user/model/http/user.model';

export class LoginResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  tokenExpires: number;

  @ApiProperty({
    type: () => UserResponse,
  })
  user: UserResponse;
}
