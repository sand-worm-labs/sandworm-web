import { generateText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Block specs returned to client — client applies these to Y.Doc
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
}

export async function POST(req: NextRequest) {
  const body: NotebookAIRequest = await req.json();
  const { prompt, dataSources = [], dataframes = [] } = body;

  const blocks: BlockSpec[] = [];

  const dataSourceContext =
    dataSources.length > 0
      ? `Available data sources:\n${dataSources.map(ds => `- ${ds.name} (id: ${ds.id}, type: ${ds.type})`).join("\n")}`
      : "No data sources connected.";

  const dataframeContext =
    dataframes.length > 0
      ? `Available dataframes from prior blocks: ${dataframes.join(", ")}`
      : "No dataframes available yet.";

  await generateText({
    model: google("gemini-2.0-flash"),
    maxSteps: 1, // single pass, multiple tool calls
    system: `You are an AI assistant that helps users build blockchain analytics notebooks.
A notebook is composed of blocks. You create blocks by calling tools.
You may call multiple tools in a single response — the order of calls is the order blocks appear.

Block types available:
- title: A large heading for the notebook or a section
- sql: A SQL query block. Write real, executable SQL.
- python: A Python block. Write real, executable Python (pandas, matplotlib available).
- richtext: A prose/markdown text block for explanations or commentary.
- visualization: A chart block that reads from a dataframe produced by a prior SQL or Python block.

Rules:
- Always start with a title block unless the user explicitly doesn't want one.
- SQL blocks should have complete, runnable queries. Use the correct dataSourceId from the available sources.
- For visualization blocks, reference the dataframeName that a prior SQL block would produce.
- Multiple SQL blocks are fine — create as many as the analysis requires.
- richtext blocks are for commentary between analytical blocks, not required.

${dataSourceContext}
${dataframeContext}`,
    prompt,
    tools: {
      createTitleBlock: tool({
        description: "Create a title block at the top of the notebook.",
        parameters: z.object({
          text: z.string().describe("The title text"),
        }),
        execute: async ({ text }) => {
          blocks.push({ type: "title", text });
          return { created: true };
        },
      }),

      createSQLBlock: tool({
        description: "Create a SQL query block.",
        parameters: z.object({
          source: z.string().describe("The SQL query to execute"),
          dataSourceId: z
            .string()
            .nullable()
            .describe(
              "The data source ID to run this query against. Use null if unknown."
            ),
        }),
        execute: async ({ source, dataSourceId }) => {
          blocks.push({
            type: "sql",
            source,
            dataSourceId,
            isFileDataSource: false,
          });
          return { created: true };
        },
      }),

      createPythonBlock: tool({
        description: "Create a Python code block.",
        parameters: z.object({
          source: z.string().describe("The Python code to execute"),
        }),
        execute: async ({ source }) => {
          blocks.push({ type: "python", source });
          return { created: true };
        },
      }),

      createRichTextBlock: tool({
        description:
          "Create a rich text / prose block for explanations or section headers.",
        parameters: z.object({
          text: z.string().describe("Plain text content for the block"),
        }),
        execute: async ({ text }) => {
          blocks.push({ type: "richtext", text });
          return { created: true };
        },
      }),

      createVisualizationBlock: tool({
        description:
          "Create a visualization/chart block that reads from a dataframe.",
        parameters: z.object({
          dataframeName: z
            .string()
            .nullable()
            .describe(
              "The dataframe name produced by a prior SQL or Python block. Use null if none available yet."
            ),
        }),
        execute: async ({ dataframeName }) => {
          blocks.push({ type: "visualization", dataframeName });
          return { created: true };
        },
      }),
    },
  });

  return NextResponse.json({ blocks } satisfies NotebookAIResponse);
}
