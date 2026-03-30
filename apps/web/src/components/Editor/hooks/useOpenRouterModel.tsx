import { useState, useCallback, useMemo } from "react";

import {
  useGetOpenRouterModelsQuery,
  useGetOpenRouterAccountCreditsQuery,
  useSetWorkspaceDefaultAiModelMutation,
  type GetOpenRouterModelsQuery,
} from "@/generated/graphql";

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

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const REASONING_KEYWORDS = [
  "r1",
  "thinking",
  "o1",
  "o3",
  "o4",
  "qwq",
  "reasoning",
];

// ─── UTILS ───────────────────────────────────────────────────────────────────

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

// ─── HOOK ────────────────────────────────────────────────────────────────────

export const useOpenRouterModels = (
  workspaceId: string,
  initialModelId?: string
) => {
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
    },
    [workspaceId, setDefaultModel]
  );

  return {
    // models
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
