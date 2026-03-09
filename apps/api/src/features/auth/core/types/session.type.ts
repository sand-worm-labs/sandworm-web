import { UserResponse } from "@/features/user/model/http/user.model";

export class Session {
  id: string;
  user: UserResponse;
  hash: string;
  roles?: Record<string, string>[]; 
}