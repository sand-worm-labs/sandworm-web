import { getPartition, getChannel } from '../lock.utils';
import { LOCK_CONFIG } from '../lock.constants';

describe('lock.utils', () => {
  describe('getPartition', () => {
    it('deterministically maps the same name to the same partition', () => {
      expect(getPartition('my-lock')).toBe(getPartition('my-lock'));
    });

    it('returns a value within [0, NUM_PARTITIONS)', () => {
      for (const name of ['a', 'b', 'lock-1', 'workspace:123']) {
        const partition = getPartition(name);
        expect(partition).toBeGreaterThanOrEqual(0);
        expect(partition).toBeLessThan(LOCK_CONFIG.NUM_PARTITIONS);
      }
    });

    it('generally distinguishes different names', () => {
      expect(getPartition('lock-a')).not.toBe(getPartition('lock-b'));
    });
  });

  describe('getChannel', () => {
    it('prefixes the partition with lock_releases_', () => {
      const partition = getPartition('my-lock');

      expect(getChannel('my-lock')).toBe(`lock_releases_${partition}`);
    });
  });
});
