import { ChatService } from "@/services/firebase/db/chats/ChatService";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log("GET /api/chat/[id] called with params:", params);
  const id = await Promise.resolve(params.id);

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing ID" }), {
      status: 400,
    });
  }

  try {
    const result = await ChatService.getChatById({ id });

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.message || "Chat not found" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(result.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in getChatById route:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
