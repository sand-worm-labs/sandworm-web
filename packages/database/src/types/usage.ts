import type { LanguageModelUsage } from "ai";

export type ContextData = {
    inputMax?: number;
    outputMax?: number;
    combinedMax?: number;
    totalMax?: number;
};

export type TokenCosts = {
    inputUSD?: number;
    outputUSD?: number;
    totalUSD?: number;
    reasoningUSD?: number;
    cacheReadUSD?: number;
    cacheWriteUSD?: number;
};

export type UsageData = {
    context?: ContextData;
    costUSD?: TokenCosts;
};


// Server-merged usage: base usage + TokenLens summary + optional modelId
export type AppUsage = LanguageModelUsage & UsageData & { modelId?: string };
