import { Session } from '@/api/session/domain/session';
import { UserResponse } from '@/api/user/model/http/user.model';

export type JwtPayloadType = Pick<UserResponse, 'id' > & {
  sessionId: Session['id'];
  iat: number;
  exp: number;
};
