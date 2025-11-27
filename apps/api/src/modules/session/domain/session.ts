import { UserResponse } from '@/api/user/model/http/user.model';

export class Session {
  id: string | string;
  user: UserResponse;
  hash: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
