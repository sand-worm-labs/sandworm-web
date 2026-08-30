"use client";

import { useEffect } from "react";
import { useApolloClient } from "@apollo/client";
import { loadCategoriesFromApi, loadToolsFromApi } from "@sandworm/editor";

import { fetchCategoriesForRegistry } from "@/graphql/loaders/tool-categories";
import { fetchToolsForRegistry } from "@/graphql/loaders/tools";

// Loads the power tool catalog and category taxonomy once, at app startup,
// from the DB-backed getTools/getToolCategories queries — see
// loadToolsFromApi's own docs for why this needs to happen before
// PowerToolboxModal or anything else reading the registry synchronously
// (getAllTools/getAllCategories/getToolsByCategory/searchTools) can render.
export function PowerToolsBootstrap() {
  const client = useApolloClient();

  useEffect(() => {
    loadToolsFromApi(() => fetchToolsForRegistry(client));
    loadCategoriesFromApi(() => fetchCategoriesForRegistry(client));
  }, [client]);

  return null;
}
