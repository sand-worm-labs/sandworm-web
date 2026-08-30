import type { ApolloClient } from "@apollo/client";
import type { ParamDefinition, ToolDefinition, UiHint } from "@sandworm/editor";

import { GetToolsDocument, type GetToolsQuery } from "@/generated/graphql";

// Shared by PowerToolsBootstrap (kicks off the load once, at app startup)
// and PowerToolboxModal (re-triggers the same idempotent load if it hasn't
// resolved yet by the time the modal first opens) — see loadToolsFromApi's
// own docs on why more than one caller invoking it is safe.
export async function fetchToolsForRegistry(
  client: ApolloClient
): Promise<Array<ToolDefinition & { template: string }>> {
  const { data } = await client.query<GetToolsQuery>({
    query: GetToolsDocument,
    fetchPolicy: "network-only",
  });

  return data.getTools.map((tool): ToolDefinition & { template: string } => ({
    id: tool.toolId,
    templateId: tool.toolId,
    categoryId: tool.categoryId,
    name: tool.name,
    description: tool.description,
    tags: tool.tags,
    uiHint: "form" as UiHint,
    params: tool.params as ParamDefinition[],
    template: "",
  }));
}
