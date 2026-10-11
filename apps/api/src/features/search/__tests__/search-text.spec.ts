import { normalizeText, parseQuery } from '../search-text';

describe('normalizeText', () => {
  it('reduces text to lower-case letters and digits separated by single spaces', () => {
    expect(normalizeText('Pump.Fun')).toBe('pump fun');
    expect(normalizeText('  Uniswap   V3 ')).toBe('uniswap v3');
    expect(normalizeText('x-ray')).toBe('x ray');
  });

  it('drops accents, as the search_normalize() SQL function does', () => {
    expect(normalizeText('Zürich Labs')).toBe('zurich labs');
    expect(normalizeText('Crème brûlée')).toBe('creme brulee');
  });

  it('returns an empty string when nothing searchable is left', () => {
    expect(normalizeText('  ...!!! ')).toBe('');
  });
});

describe('parseQuery', () => {
  it('makes every word a prefix, so a half-typed word still matches', () => {
    expect(parseQuery('uni swa')).toEqual({
      term: 'uni swa',
      tsquery: 'uni:* & swa:*',
      titleTsquery: 'uni:*A & swa:*A',
    });
  });

  it('treats an empty or symbol-only query as browsing', () => {
    expect(parseQuery('')).toEqual({
      term: '',
      tsquery: null,
      titleTsquery: null,
    });
    expect(parseQuery(' ?! ')).toEqual({
      term: '',
      tsquery: null,
      titleTsquery: null,
    });
  });

  it('can never produce tsquery syntax from input', () => {
    // Quotes, operators, parentheses and colons all become spaces before the query is built.
    const { tsquery } = parseQuery(`a' | b & !(c):* <-> d`);
    expect(tsquery).toBe('a:* & b:* & c:* & d:*');
    expect(tsquery).not.toMatch(/[|!()<>'"]/);
  });

  it('cuts very long input short', () => {
    expect(parseQuery('a'.repeat(500)).term).toHaveLength(100);
  });
});
