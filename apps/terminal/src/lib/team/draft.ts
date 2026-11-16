import type { TeamClientDraft } from "@/types";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL.test(email.trim());
}

export function canLeaveDetails({ details }: TeamClientDraft): boolean {
  return details.name.trim().length > 0 && isValidEmail(details.adminEmail);
}

export function toggleId(ids: readonly string[], id: string): string[] {
  return ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id];
}

export function describeInvite(draft: TeamClientDraft): string {
  const { adminName, adminEmail } = draft.details;
  const who = [adminName.trim(), adminEmail.trim()].filter(Boolean).join(", ");

  return who ? `${who}, as admin.` : "Add the client admin on the first step.";
}
