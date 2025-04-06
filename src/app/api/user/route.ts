import "server-only";
import "@/services/firebase";

import { UserService } from "@/services/firebase/db/users";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const uid = params.id;
  const result = await UserService.findUserById(uid || "");
  if (!result.success)
    return new Response(JSON.stringify(result), { status: 500 });
  return new Response(JSON.stringify(result.data));
}
