// Pure rules for inviting a client's admin, kept apart from the database so they can be tested.

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

// An invite is claimed by email, so only an address the person has proved they own counts.
export function canClaimInvite(user: {
  email?: string | null;
  emailVerified?: boolean | null;
  emailVerifiedAt?: Date | null;
}): boolean {
  if (!user.email) return false;
  return user.emailVerified === true || Boolean(user.emailVerifiedAt);
}
