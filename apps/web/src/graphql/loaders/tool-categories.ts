import type { ApolloClient } from "@apollo/client";
import type { ToolCategory } from "@sandworm/editor";

import {
  GetToolCategoriesDocument,
  type GetToolCategoriesQuery,
} from "@/generated/graphql";

// Shared by PowerToolsBootstrap (kicks off the load once, at app startup)
// and PowerToolboxModal (re-triggers the same idempotent load if it hasn't
// resolved yet by the time the modal first opens) — see
// loadCategoriesFromApi's own docs on why more than one caller invoking it
// is safe.
export async function fetchCategoriesForRegistry(
  client: ApolloClient
): Promise<ToolCategory[]> {
  const { data } = await client.query<GetToolCategoriesQuery>({
    query: GetToolCategoriesDocument,
    fetchPolicy: "network-only",
  });

  return data.getToolCategories.map(
    (category): ToolCategory => ({
      id: category.categoryId,
      name: category.name,
      description: category.description,
    })
  );
}
