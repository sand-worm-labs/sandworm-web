import { UserResponse } from "@/features/user/model/http/user.model";

export class Session {
  id: string;
  user: UserResponse;
  hash: string;
  userWorkspaces?: Record<string, { role: string }>;
}