import { z } from 'zod';

export const LINK_KEYS = ['website', 'twitter', 'github', 'discord', 'telegram'] as const;
export type LinkKey = (typeof LINK_KEYS)[number];

// What a person types for a link: a full URL, or just a handle or name for the sites that have
// them. It is stored as a full https URL, because it is used as an href: nothing but http(s)
// gets through, so a "javascript:" link can never be saved.
const BASES: Record<Exclude<LinkKey, 'website'>, string> = {
  twitter: 'https://x.com/',
  github: 'https://github.com/',
  discord: 'https://discord.gg/',
  telegram: 'https://t.me/',
};

export function normalizeLink(key: LinkKey, raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  const isUrl = /^[a-z][a-z0-9+.-]*:/i.test(value);
  let candidate = value;
  if (!isUrl) {
    candidate =
      key === 'website'
        ? `https://${value}`
        : `${BASES[key]}${value.replace(/^@/, '').replace(/^\/+/, '')}`;
  }

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (!url.hostname.includes('.')) return null;
    // x.com and twitter.com are the same account; keep one spelling.
    if (key === 'twitter') url.hostname = url.hostname.replace(/^(www\.)?twitter\.com$/, 'x.com');
    return url.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

export const ProtocolLinksInput = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single dashes')
    .max(80),
  name: z.string().trim().min(1).max(80),
  links: z.record(z.string(), z.string().max(300)).default({}),
});

// Each link that is filled in, as a clean URL; the ones left empty are dropped. A link that
// does not parse is an error, so a typo is not silently lost.
export function cleanLinks(links: Record<string, string>): { links: Partial<Record<LinkKey, string>>; problems: string[] } {
  const clean: Partial<Record<LinkKey, string>> = {};
  const problems: string[] = [];
  for (const [key, raw] of Object.entries(links)) {
    if (!(LINK_KEYS as readonly string[]).includes(key)) {
      problems.push(`${key}: not a link we show`);
      continue;
    }
    if (!raw.trim()) continue;
    const url = normalizeLink(key as LinkKey, raw);
    if (url) clean[key as LinkKey] = url;
    else problems.push(`${key}: "${raw.trim()}" is not a link`);
  }
  return { links: clean, problems };
}
