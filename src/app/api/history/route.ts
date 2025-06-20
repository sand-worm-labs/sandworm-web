import { auth } from "@/services/auth";
import { ChatService } from "@/services/firebase/db/chats/ChatService";

export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return Response.json("Unauthorized!", { status: 401 });
  }

  const chats = await ChatService.getChatsByUserId({ id: session.user.id! });
  return Response.json(chats);
}
