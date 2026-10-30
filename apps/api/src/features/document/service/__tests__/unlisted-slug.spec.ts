import { generateUnlistedSlug } from '../unlisted-slug';

describe('generateUnlistedSlug', () => {
  it('reads as the title, then a 22-character random token', () => {
    const slug = generateUnlistedSlug('Who really holds PENGU?');
    expect(slug).toMatch(/^who-really-holds-pengu-[A-Za-z0-9_-]{22}$/);
  });

  it('never makes the same address twice for the same title', () => {
    const slugs = new Set(Array.from({ length: 500 }, () => generateUnlistedSlug('Same title')));
    expect(slugs.size).toBe(500);
  });

  it('keeps the readable start short and clean', () => {
    const slug = generateUnlistedSlug('A very long title that goes on and on and on and on and on forever');
    const start = slug.slice(0, slug.length - 23);
    expect(start.length).toBeLessThanOrEqual(40);
    expect(start.endsWith('-')).toBe(false);
  });

  it('falls back to "notebook" when the title has nothing usable in it', () => {
    expect(generateUnlistedSlug('???')).toMatch(/^notebook-[A-Za-z0-9_-]{22}$/);
    expect(generateUnlistedSlug('')).toMatch(/^notebook-[A-Za-z0-9_-]{22}$/);
  });

  it('is not derived from the document: no id, no counter, only the token keeps it secret', () => {
    // 22 base64url characters carry 16 random bytes, which is 128 bits.
    const token = generateUnlistedSlug('x').split('-').pop() as string;
    expect(Buffer.from(token, 'base64url')).toHaveLength(16);
  });
});
