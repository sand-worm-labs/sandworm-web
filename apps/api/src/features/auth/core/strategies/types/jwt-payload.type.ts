import { Session } from "@/features/session/domain/session";
import { UserResponse } from '@/features/user/model/http/user.model';

export type JwtPayloadType = Pick<UserResponse, 'id'> & {
  sessionId: Session['id'];
  iat: number;
  exp: number;
};
