import { convertToCoreMessages, streamText } from "ai";
import type { Message } from "ai";
import { z } from "zod";

import { geminiProModel } from "@/ai";
import { ChatService } from "@/services/firebase/db/chats/ChatService";
import { auth } from "@/services/auth";

export async function POST(request: Request) {
  console.log("📩 Request received at /api/chat");

  let id: string;
  let messages: Array<Message>;
  try {
    const body = await request.json();
    id = body.id;
    messages = body.messages;
    console.log("✅ Parsed request body:", { id, messages });
  } catch (err) {
    console.error("❌ Failed to parse request body:", err);
    return new Response("Invalid request body", { status: 400 });
  }

  let session;
  try {
    session = await auth();
    console.log("✅ Auth session:", session?.user?.id);
  } catch (err) {
    console.error("❌ Auth check failed:", err);
    return new Response("Failed to authenticate", { status: 500 });
  }

  let coreMessages;
  try {
    coreMessages = convertToCoreMessages(messages).filter(
      m => m.content.length > 0
    );
    console.log("✅ Core messages:", coreMessages);
  } catch (err) {
    console.error("❌ Failed to convert messages:", err);
    return new Response("Invalid message format", { status: 400 });
  }

  let result;
  try {
    result = await streamText({
      model: geminiProModel,
      system: `You are Worm AI — a smart assistant that helps users explore onchain data. Answer clearly and concisely. Today's date is ${new Date().toLocaleDateString()}.`,
      messages: coreMessages,
      tools: {
        getWeather: {
          description: "Get the current weather at a location",
          parameters: z.object({
            latitude: z.number().describe("Latitude coordinate"),
            longitude: z.number().describe("Longitude coordinate"),
          }),
          execute: async ({ latitude, longitude }) => {
            const response = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`
            );
            const weatherData = await response.json();
            return weatherData;
          },
        },
      },
      onFinish: async ({ responseMessages }) => {
        console.log("💾 onFinish triggered for chat:", id);
        if (session?.user?.id) {
          try {
            await ChatService.saveChat({
              id,
              messages: [...coreMessages, ...responseMessages],
              userId: session.user.id,
            });
            console.log("✅ Chat saved successfully");
          } catch (error) {
            console.error("❌ Failed to save chat:", error);
          }
        }
      },
      experimental_telemetry: {
        isEnabled: true,
        functionId: "stream-text",
      },
    });
    console.log("✅ streamText() returned");
  } catch (err) {
    console.error("❌ Error during streamText():", err);
    return new Response("AI generation failed", { status: 500 });
  }

  try {
    console.log("🔄 Streaming response...");
    console.log("ddd", result);
    const text = await result.textStream;
    console.log("🧠 Model output:", text);
  } catch (err) {
    console.error("❌ Failed to extract model output:", err);
  }

  try {
    return result.toDataStreamResponse({});
  } catch (err) {
    console.error("❌ Failed to stream response:", err);
    return new Response("Failed to stream response", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await ChatService.getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await ChatService.deleteChatById({ id });
    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
