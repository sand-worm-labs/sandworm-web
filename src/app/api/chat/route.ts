import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";
import { geminiProModel } from "@/ai";
import { ChatService } from "@/services/firebase/db/chats/ChatService";
import { generateUUID } from "@/lib/utils";
import { auth } from "@/services/auth";

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } =
    await request.json();

  const session = await auth();

  // Optional auth check
  // if (!session || !session.user) {
  //   return new Response("Unauthorized", { status: 401 });
  // }

  const coreMessages = convertToCoreMessages(messages).filter(
    message => message.content.length > 0
  );

  const result = await streamText({
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
      if (session?.user?.id) {
        try {
          await ChatService.saveChat({
            id,
            messages: [...coreMessages, ...responseMessages],
            userId: session.user.id,
          });
        } catch (error) {
          console.error("Failed to save chat");
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toDataStreamResponse({});
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
