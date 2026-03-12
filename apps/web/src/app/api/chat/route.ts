import { generateText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export type BlockSpec =
  | { type: "title"; text: string }
  | {
      type: "sql";
      source: string;
      dataSourceId: string | null;
      isFileDataSource: boolean;
    }
  | { type: "python"; source: string }
  | { type: "richtext"; text: string }
  | { type: "visualization"; dataframeName: string | null };

export interface NotebookAIRequest {
  prompt: string;
  dataSources?: { id: string; name: string; type: string }[];
  dataframes?: string[];
}

export interface NotebookAIResponse {
  blocks: BlockSpec[];
  reply: string;
  documentTitle: string | null;
}

export async function POST(req: NextRequest) {
  const body: NotebookAIRequest = await req.json();
  const { prompt } = body;

  let documentTitle: string | null = null;

  const result = await generateText({
    model: google("gemini-2.5-flash"),
    maxSteps: 2,
    system: `You are an AI assistant that helps users build blockchain analytics notebooks.

For every user request, always call setDocumentTitle with a short, descriptive, professional title 
that captures the analytical intent — not the user's exact words. For example if the user says 
"eth transaction analysis", a good title is "Ethereum Transaction Flow Analysis" or 
"On-chain ETH Transfer Patterns". Be creative and specific.

After calling the tool, respond conversationally to the user's actual question or request 
in 1-2 sentences. You can answer blockchain questions, explain concepts, suggest approaches. 
No markdown.`,
    prompt,
    tools: {
      setDocumentTitle: tool({
        description: "Set the main title of the current notebook document.",
        inputSchema: z.object({
          title: z.string().describe("The title to set for the notebook"),
        }),
        execute: async ({ title }) => {
          documentTitle = title;
          return { set: true };
        },
      }),
    },
  });

  console.log("[AI] documentTitle:", documentTitle);
  console.log("[AI] reply:", result.text);

  return NextResponse.json({
    blocks: [],
    reply: result.text || `Title set to "${documentTitle}".`,
    documentTitle,
  } satisfies NotebookAIResponse);
}
