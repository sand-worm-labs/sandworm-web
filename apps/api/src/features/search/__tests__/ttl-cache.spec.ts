import { TtlCache } from '../ttl-cache';

describe('TtlCache', () => {
  it('returns what was stored until it expires', () => {
    let now = 1_000;
    const cache = new TtlCache<string>(10, () => now);
    cache.set('a', 'one', 500);
    expect(cache.get('a')).toBe('one');
    now = 1_499;
    expect(cache.get('a')).toBe('one');
    now = 1_500;
    expect(cache.get('a')).toBeUndefined();
    expect(cache.size).toBe(0);
  });

  it('evicts the least recently used entry beyond its size', () => {
    const cache = new TtlCache<number>(2, () => 0);
    cache.set('a', 1, 1_000);
    cache.set('b', 2, 1_000);
    cache.get('a'); // a is now more recent than b
    cache.set('c', 3, 1_000);
    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('a')).toBe(1);
    expect(cache.get('c')).toBe(3);
  });

  it('can be cleared', () => {
    const cache = new TtlCache<number>(5, () => 0);
    cache.set('a', 1, 1_000);
    cache.clear();
    expect(cache.get('a')).toBeUndefined();
  });
});
