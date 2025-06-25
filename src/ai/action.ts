import { generateObject } from "ai";
import { z } from "zod";
import { geminiFlashModel } from ".";

// we are simulating using vercel ai to generate a WormQL query from natural language input. This will later be update to use eliza's AI model
export async function generateWormQLFromNaturalLanguage({
  prompt,
}: {
  prompt: string;
}) {
  const { object: result } = await generateObject({
    model: geminiFlashModel,
    prompt: `
  Translate the following user instruction into a WormQL query.
  
  The query should follow this structure:
  
  SELECT <fields> FROM <table> <identifier?> ON <chains>
  
  Valid tables:
  - account
  - block
  - transaction
  
  Valid fields include: balance, chain, timestamp, etc. Use * if unsure.
  
  Examples:
  "what's vitalik.eth balance on base"
  → SELECT balance FROM account vitalik.eth ON base
  
  "show transaction 0xabc123"
  → SELECT * FROM transaction 0xabc123 ON eth
  
  "get block 1000 on sui"
  → SELECT * FROM block 1000 ON sui_mainnet
  
  Now generate WormQL for:
  "${prompt}"
  `,
    schema: z.object({
      query: z.string().describe("WormQL query string"),
    }),
  });

  return result;
}
