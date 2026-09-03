import { useState, useCallback, useEffect, useMemo } from "react";
import { useApolloClient } from "@apollo/client";

import {
  useGetOpenRouterModelsQuery,
  useGetOpenRouterAccountCreditsQuery,
  useSetWorkspaceDefaultAiModelMutation,
  type GetOpenRouterModelsQuery,
} from "@/generated/graphql";

// =====================================
// ⬢ Types
// =====================================
type RawModel = GetOpenRouterModelsQuery["openRouterModels"][number];

export interface NormalizedModel {
  id: string;
  name: string;
  provider: string;
  contextLength: number | null;
  isFree: boolean;
  promptPricePerM: number | null;
  outputPricePerM: number | null;
  inputModalities: string[];
  outputModalities: string[];
  supportsTools: boolean;
  isReasoning: boolean;
  description: string | null;
}

export interface AccountCredits {
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
}

// =====================================
// ⬢ Constants
// =====================================
const REASONING_KEYWORDS = [
  "r1",
  "thinking",
  "o1",
  "o3",
  "o4",
  "qwq",
  "reasoning",
];

// =====================================
// ⬢ Utilities
// =====================================
function parsePricePerM(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const parsed = parseFloat(raw);
  return Number.isNaN(parsed) ? null : parsed * 1_000_000;
}

function deriveIsFree(raw: RawModel, promptRaw: number | null): boolean {
  return promptRaw === 0 || raw.id.endsWith(":free");
}

function deriveIsReasoning(id: string): boolean {
  const lower = id.toLowerCase();
  return REASONING_KEYWORDS.some(kw => lower.includes(kw));
}

function normalizeModel(raw: RawModel): NormalizedModel {
  const d = raw.details;
  const promptRaw = d?.pricing?.prompt ? parseFloat(d.pricing.prompt) : null;

  return {
    id: raw.id,
    name: raw.name,
    provider: raw.id.split("/")[0] ?? "unknown",
    contextLength: d?.contextLength ?? d?.topProvider?.contextLength ?? null,
    isFree: deriveIsFree(raw, promptRaw),
    promptPricePerM: parsePricePerM(d?.pricing?.prompt),
    outputPricePerM: parsePricePerM(d?.pricing?.completion),
    inputModalities: d?.details?.architecture?.inputModalities ?? ["text"],
    outputModalities: d?.details?.architecture?.outputModalities ?? ["text"],
    supportsTools: (d?.supportedParameters ?? []).includes("tools"),
    isReasoning: deriveIsReasoning(raw.id),
    description: d?.description ?? null,
  };
}

// =====================================
// ⬢  Use Open Router Models
// =====================================
export const useOpenRouterModels = (
  workspaceId: string,
  initialModelId?: string
) => {
  const client = useApolloClient();
  const { data, loading, error } = useGetOpenRouterModelsQuery();

  const {
    data: creditsData,
    loading: creditsLoading,
    error: creditsError,
  } = useGetOpenRouterAccountCreditsQuery({
    variables: { workspaceId },
    skip: !workspaceId,
  });

  const [setDefaultModel, { loading: settingDefault, error: setDefaultError }] =
    useSetWorkspaceDefaultAiModelMutation();

  const [selectedModelId, setSelectedModelId] = useState<string | null>(
    initialModelId ?? null
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // `initialModelId` only seeds state on mount — re-sync whenever the
  // workspace's default model changes underneath us (e.g. picked from a
  // different mounted instance of this hook, like the Settings modal vs.
  // the main chat panel).
  useEffect(() => {
    setSelectedModelId(initialModelId ?? null);
  }, [initialModelId]);

  const models = useMemo<NormalizedModel[]>(
    () => (data?.openRouterModels ?? []).map(normalizeModel),
    [data]
  );

  const selectedModel = useMemo(
    () => models.find(m => m.id === selectedModelId) ?? null,
    [models, selectedModelId]
  );

  const credits = useMemo<AccountCredits | null>(
    () => creditsData?.openRouterAccountCredits ?? null,
    [creditsData]
  );

  const openPicker = useCallback(() => setIsPickerOpen(true), []);
  const closePicker = useCallback(() => setIsPickerOpen(false), []);

  const selectModel = useCallback(
    async (modelId: string) => {
      setSelectedModelId(modelId);
      setIsPickerOpen(false);

      await setDefaultModel({
        variables: { workspaceId, model: modelId },
      });

      // The mutation only returns a bare scalar, so Apollo has nothing to
      // normalize back into the Workspace entity on its own — write it
      // directly so every other query reading `workspace.assistantModel`
      // (main chat, MiniChat, this same picker elsewhere) updates in place.
      client.cache.modify({
        id: client.cache.identify({ __typename: "Workspace", id: workspaceId }),
        fields: {
          assistantModel: () => modelId,
        },
      });
    },
    [workspaceId, setDefaultModel, client]
  );

  return {
    models,
    loading,
    error,
    selectedModelId,
    selectedModel,
    selectModel,
    isPickerOpen,
    openPicker,
    closePicker,
    credits,
    creditsLoading,
    creditsError,
    settingDefault,
    setDefaultError,
  };
};
