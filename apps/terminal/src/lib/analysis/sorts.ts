export const ANALYSIS_SORTS = ["recent", "relevant", "alphabetical"] as const;

export type AnalysisSort = (typeof ANALYSIS_SORTS)[number];
