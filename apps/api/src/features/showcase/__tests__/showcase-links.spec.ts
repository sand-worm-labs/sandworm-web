import { cleanLinks, normalizeLink } from '../showcase-links';

describe('normalizeLink', () => {
  it('turns a handle into the full address for its site', () => {
    expect(normalizeLink('twitter', '@pumpdotfun')).toBe('https://x.com/pumpdotfun');
    expect(normalizeLink('twitter', 'pumpdotfun')).toBe('https://x.com/pumpdotfun');
    expect(normalizeLink('github', 'aave')).toBe('https://github.com/aave');
    expect(normalizeLink('telegram', 'pumpfun')).toBe('https://t.me/pumpfun');
    expect(normalizeLink('discord', 'abc123')).toBe('https://discord.gg/abc123');
  });

  it('adds https to a bare website and keeps a full address as it is', () => {
    expect(normalizeLink('website', 'paj.cash')).toBe('https://paj.cash');
    expect(normalizeLink('website', 'https://aave.com/')).toBe('https://aave.com');
    expect(normalizeLink('github', 'https://github.com/aave/aave-v3-core')).toBe(
      'https://github.com/aave/aave-v3-core',
    );
  });

  it('writes twitter.com as x.com', () => {
    expect(normalizeLink('twitter', 'https://twitter.com/aave')).toBe('https://x.com/aave');
    expect(normalizeLink('twitter', 'https://www.twitter.com/aave')).toBe('https://x.com/aave');
  });

  it('refuses anything that is not an http(s) address, so it can never be an unsafe href', () => {
    expect(normalizeLink('website', 'javascript:alert(1)')).toBeNull();
    expect(normalizeLink('website', 'data:text/html,<script>1</script>')).toBeNull();
    expect(normalizeLink('website', 'ftp://example.com')).toBeNull();
    expect(normalizeLink('website', 'not a link')).toBeNull();
  });

  it('treats an empty value as no link', () => {
    expect(normalizeLink('website', '   ')).toBeNull();
  });
});

describe('cleanLinks', () => {
  it('keeps the filled links as clean URLs and drops the empty ones', () => {
    expect(cleanLinks({ website: 'aave.com', twitter: '@aave', github: '', discord: '  ' })).toEqual({
      links: { website: 'https://aave.com', twitter: 'https://x.com/aave' },
      problems: [],
    });
  });

  it('reports a link that does not parse and a key that is not one we show', () => {
    const { links, problems } = cleanLinks({ website: 'javascript:alert(1)', myspace: 'x', twitter: 'aave' });
    expect(links).toEqual({ twitter: 'https://x.com/aave' });
    expect(problems).toHaveLength(2);
    expect(problems.join(' ')).toContain('website');
    expect(problems.join(' ')).toContain('myspace');
  });
});
