import { randomBytes } from 'crypto';

// 16 random bytes: 128 bits, written as 22 URL-safe characters.
const TOKEN_BYTES = 16;

// The address of an unlisted notebook: a readable start, then a random token. The token is what keeps the address
// secret; the title is only there so a link reads as what it is. Public notebooks use the document id's first eight
// characters instead (see DocumentService.generateUniqueSlug), which is fine for a listed page and not for a secret.
export function generateUnlistedSlug(title: string): string {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40)
      .replace(/-$/, '') || 'notebook';
  return `${base}-${randomBytes(TOKEN_BYTES).toString('base64url')}`;
}
