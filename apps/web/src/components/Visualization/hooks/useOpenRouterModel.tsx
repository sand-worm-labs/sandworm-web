import { useState, useCallback, useMemo } from "react";

import {
  useGetOpenRouterModelsQuery,
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

const normalizeModel = (raw: RawModel): NormalizedModel => {
  const d = raw.details;

  const contextLength =
    d?.contextLength ?? d?.topProvider?.contextLength ?? null;

  const promptRaw = d?.pricing?.prompt ? parseFloat(d.pricing.prompt) : null;
  const outputRaw = d?.pricing?.completion
    ? parseFloat(d.pricing.completion)
    : null;
  const promptPerM = promptRaw != null ? promptRaw * 1_000_000 : null;
  const outputPerM = outputRaw != null ? outputRaw * 1_000_000 : null;
  const isFree = promptRaw === 0 || raw.id.endsWith(":free");

  const inputModalities = d?.details?.architecture?.inputModalities ?? ["text"];
  const outputModalities = d?.details?.architecture?.outputModalities ?? [
    "text",
  ];

  const supportsTools = (d?.supportedParameters ?? []).includes("tools");

  const idLower = raw.id.toLowerCase();
  const isReasoning =
    idLower.includes("r1") ||
    idLower.includes("thinking") ||
    idLower.includes("o1") ||
    idLower.includes("o3") ||
    idLower.includes("o4") ||
    idLower.includes("qwq") ||
    idLower.includes("reasoning");

  return {
    id: raw.id,
    name: raw.name,
    provider: raw.id.split("/")[0] ?? "unknown",
    contextLength,
    isFree,
    promptPricePerM: promptPerM,
    outputPricePerM: outputPerM,
    inputModalities,
    outputModalities,
    supportsTools,
    isReasoning,
    description: d?.description ?? null,
  };
};

export const useOpenRouterModels = () => {
  const { data, loading, error } = useGetOpenRouterModelsQuery();

  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const models = useMemo<NormalizedModel[]>(
    () => (data?.openRouterModels ?? []).map(normalizeModel),
    [data]
  );

  const selectedModel = useMemo(
    () => models.find(m => m.id === selectedModelId) ?? null,
    [models, selectedModelId]
  );

  const openPicker = useCallback(() => setIsPickerOpen(true), []);
  const closePicker = useCallback(() => setIsPickerOpen(false), []);
  const selectModel = useCallback((modelId: string) => {
    setSelectedModelId(modelId);
    setIsPickerOpen(false);
  }, []);

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
  };
};
