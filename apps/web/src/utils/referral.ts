// Sign-up is invite-only. The code is kept for the tab's session so it
// survives the OAuth popup and the multi-step email form.
const KEY = "referralCode";

export const getReferralCode = (): string | undefined => {
  try {
    return sessionStorage.getItem(KEY)?.trim() || undefined;
  } catch {
    return undefined;
  }
};

export const setReferralCode = (code: string) => {
  try {
    sessionStorage.setItem(KEY, code);
  } catch {
    /* empty */
  }
};
