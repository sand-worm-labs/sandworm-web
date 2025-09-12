import { type NextRequest } from "next/server";
import { type Message as VercelChatMessage } from "ai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

import { ChatService } from "@/services/firebase/db/chats/ChatService";
import { auth } from "@/services/auth";

export const runtime = "nodejs";

// ---- Schema & System Template ----
const dbSchema = `
TABLE base.uniswap_burn (
  id STRING,
  transaction_id STRING,
  pool_id STRING,
  owner STRING,
  amount0 STRING,
  amount1 STRING,
  amount_usd STRING,
  tick_lower INT,
  tick_upper INT,
  timestamp TIMESTAMP,
  log_index INT
);

TABLE base.uniswap_swap (
  id STRING,
  transaction_id STRING,
  pool_id STRING,
  sender STRING,
  recipient STRING,
  amount0 STRING,
  amount1 STRING,
  amount_usd STRING,
  sqrt_price_x96 STRING,
  tick INT,
  log_index INT,
  timestamp TIMESTAMP
);
`;

const SYSTEM_TEMPLATE = `
You are a SQL generator for analytics.
You ONLY produce SQL for the provided schema.

Schema:
{schema}

Defaults:
- chain: "base"
- time_range: "latest"
- entity: none unless specified by user

If enough info is available (including defaults), output only JSON in this format:
{{"needs_clarification": false, "sql": "<SQL>"}}

If more info is truly required, output:
{{"needs_clarification": true, "missing": ["field1"], "question": "short follow-up"}}

User query: {query}
`;

// ---- Zod Schema ----
const OutputSchema = z.object({
  needs_clarification: z.boolean(),
  sql: z.string().optional(),
  missing: z.array(z.string()).optional(),
  question: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // Parse request body
  let id: string;
  let rawMessages: Array<VercelChatMessage>;
  try {
    const body = await request.json();
    id = body.id;
    rawMessages = body.messages;
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }

  // Auth
  let session;
  try {
    session = await auth();
  } catch {
    return new Response("Failed to authenticate", { status: 500 });
  }

  // Grab last user message
  const lastUserMessage =
    rawMessages?.filter(m => m.role === "user").pop()?.content || "";

  // Setup LLM with structured output
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash-001",
    temperature: 0,
    streaming: false,
  });

  const functionCallingModel = model.withStructuredOutput(OutputSchema, {
    name: "sql_output_formatter",
  });

  const prompt = PromptTemplate.fromTemplate(SYSTEM_TEMPLATE);
  const chain = prompt.pipe(functionCallingModel);

  try {
    const result = await chain.invoke({
      schema: dbSchema,
      query: lastUserMessage,
    });

    const responseContent = JSON.stringify(result);

    // Save chat in DB
    if (session?.user?.id) {
      const newMessage: VercelChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: responseContent,
      };

      await ChatService.saveChat({
        id,
        messages: [...rawMessages, newMessage],
        userId: session.user.id,
      });
    }

    // Return plain text response for useChat
    return new Response(responseContent, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch {
    return new Response("AI generation failed", { status: 500 });
  }
}

// ---- DELETE ----
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return new Response("Not Found", { status: 404 });

  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  try {
    const chatResult = await ChatService.getChatById({ id });
    if (!chatResult.success) {
      return new Response("Not Found", { status: 404 });
    }
    if (chatResult.data.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }
    await ChatService.deleteChatById({ id });
    return new Response("Chat deleted", { status: 200 });
  } catch {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
