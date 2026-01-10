import { UserResponse } from '@/features/user/model/http/user.model';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiPropertyOptional({
    type: 'object',
    description: 'User workspace roles',
    example: [
      { 'workspace-1': 'admin' },
      { 'workspace-2': 'member' }
    ],
    additionalProperties: { type: 'string' },
    default: []
  })
  roles?: Record<string, string>[];

}
