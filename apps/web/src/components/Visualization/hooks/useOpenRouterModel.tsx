import { useState, useCallback, useMemo } from "react";

import {
  useGetOpenRouterModelsQuery,
  type GetOpenRouterModelsQuery,
} from "@/generated/graphql";

type RawModel = GetOpenRouterModelsQuery["openRouterModels"][number];

interface ModelDetails {
  context_length?: number;
  pricing?: { prompt?: string; completion?: string };
  top_provider?: { context_length?: number };
}

export interface NormalizedModel {
  id: string;
  name: string;
  provider: string;
  contextLength: number | null;
  isFree: boolean;
}

const normalizeModel = (model: RawModel): NormalizedModel => {
  const details = (model.details ?? {}) as ModelDetails;
  const promptPrice = details.pricing?.prompt
    ? parseFloat(details.pricing.prompt)
    : null;

  return {
    id: model.id,
    name: model.name,
    provider: model.id.split("/")[0] ?? "unknown",
    contextLength:
      details.context_length ?? details.top_provider?.context_length ?? null,
    isFree: promptPrice === 0,
  };
};

export const useOpenRouterModels = () => {
  const { data, loading, error } = useGetOpenRouterModelsQuery();

  console.log("models", data);

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
