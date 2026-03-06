import { UserResponse } from "@/features/user/model/http/user.model";

export class Session {
  id: string;
  user: UserResponse;
  hash: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  userWorkspaces?: Record<string, { role: string }>;
}