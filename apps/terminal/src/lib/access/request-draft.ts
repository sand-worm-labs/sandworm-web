export type RequestAccessDraft = {
  organisation: string;
  interest: string;
};

export const EMPTY_REQUEST_ACCESS_DRAFT: RequestAccessDraft = {
  organisation: "",
  interest: "",
};

export function canSubmitAccessRequest(draft: RequestAccessDraft): boolean {
  return draft.organisation.trim().length > 0;
}
