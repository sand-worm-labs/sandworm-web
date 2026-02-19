import { SuccessRunQueryResult } from "@sandworm/types";

// accepts only alphanumeric characters, spaces and hyphens
const nameRegex = /^[a-zA-Z0-9\s-]+$/

export function isWorkspaceNameValid(name: string) {
  return nameRegex.test(name)
}

export function isUserNameValid(name: string) {
  return nameRegex.test(name)
}

export const getQueryDuration = (result: SuccessRunQueryResult | null): number => {
  if (!result) return 0;

  // V2 and V3 have queryDurationMs
  if ('queryDurationMs' in result) {
    return result.queryDurationMs;
  }

  // V1 has durationMs
  if ('durationMs' in result) {
    return result.durationMs;
  }

  return 0;
};

export const getDocId = (
  documentId: string,
  app: { id: string; userId: string | null } | null,
): string => {
  if (app) {
    return [documentId, app.id, String(app.userId)].join('-');
  }
  return [documentId, 'null'].join('-');
}