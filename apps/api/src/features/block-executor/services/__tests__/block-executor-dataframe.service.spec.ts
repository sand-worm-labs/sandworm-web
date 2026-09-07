// DataFrameService transitively drags in the Jupyter/code-execution stack
// (PythonExecutorService -> @jupyterlab/services, an ESM-only SDK) — stub it
// via an explicit factory so jest never loads the real module.
jest.mock('@/features/code-execution/query-engine/dataframe/dataframe.service', () => ({
  DataFrameService: jest.fn(),
}));

import * as Y from 'yjs';
import { DataFrame } from '@sandworm/types';
import { BlockExecutorDataframeService } from '../block-executor-dataframe.service';

function makeService(dataframeService: any = { list: jest.fn() }) {
  return { service: new BlockExecutorDataframeService(dataframeService), dataframeService };
}

function makeDataframesMap(): { doc: Y.Doc; dataframes: Y.Map<DataFrame> } {
  const doc = new Y.Doc();
  const dataframes = doc.getMap<DataFrame>('dataframes');
  return { doc, dataframes };
}

function makeDataframe(name: string, overrides: Partial<DataFrame> = {}): DataFrame {
  return {
    name,
    columns: [{ name: 'col_a', type: 'int64' } as any],
    blockId: 'block-owner',
    ...overrides,
  };
}

describe('BlockExecutorDataframeService', () => {
  describe('updateDataframesInMap', () => {
    it('adds a new dataframe owned by the current block', () => {
      const { service } = makeService();
      const { dataframes } = makeDataframesMap();
      const incoming = makeDataframe('df1', { blockId: undefined });

      service.updateDataframesInMap(dataframes, [incoming], 'block-1', new Set(['block-1']));

      expect(dataframes.has('df1')).toBe(true);
      expect(dataframes.get('df1')?.blockId).toBe('block-1');
    });

    it('updates an existing dataframe when its columns changed', () => {
      const { service } = makeService();
      const { dataframes } = makeDataframesMap();
      dataframes.set('df1', makeDataframe('df1', { blockId: 'block-1' }));

      const updated = makeDataframe('df1', {
        blockId: 'block-1',
        columns: [{ name: 'col_b', type: 'string' } as any],
      });

      service.updateDataframesInMap(dataframes, [updated], 'block-1', new Set(['block-1']));

      expect(dataframes.get('df1')?.columns).toEqual([{ name: 'col_b', type: 'string' }]);
    });

    it('leaves an existing dataframe untouched when its columns are unchanged', () => {
      const { service } = makeService();
      const { dataframes } = makeDataframesMap();
      const original = makeDataframe('df1', { blockId: 'block-1' });
      dataframes.set('df1', original);

      const sameShape = makeDataframe('df1', { blockId: 'block-1' });
      service.updateDataframesInMap(dataframes, [sameShape], 'block-1', new Set(['block-1']));

      // Since columns are `equals`, the update branch returns early and never
      // calls `.set`, so the stored value is still the original reference.
      expect(dataframes.get('df1')).toBe(original);
    });

    it('backfills blockId on update when the incoming dataframe has none', () => {
      const { service } = makeService();
      const { dataframes } = makeDataframesMap();
      dataframes.set('df1', makeDataframe('df1', { blockId: 'block-1' }));

      const updated = makeDataframe('df1', {
        blockId: undefined,
        columns: [{ name: 'col_c', type: 'string' } as any],
      });

      service.updateDataframesInMap(dataframes, [updated], 'block-1', new Set(['block-1']));

      expect(dataframes.get('df1')?.blockId).toBe('block-1');
    });

    it('removes a dataframe whose owning block no longer exists', () => {
      const { service } = makeService();
      const { dataframes } = makeDataframesMap();
      dataframes.set('stale', makeDataframe('stale', { blockId: 'deleted-block' }));

      service.updateDataframesInMap(dataframes, [], 'block-1', new Set(['block-1']));

      expect(dataframes.has('stale')).toBe(false);
    });

    it('removes a dataframe owned by the block that was just re-run and no longer produces it', () => {
      const { service } = makeService();
      const { dataframes } = makeDataframesMap();
      dataframes.set('gone', makeDataframe('gone', { blockId: 'block-1' }));

      service.updateDataframesInMap(dataframes, [], 'block-1', new Set(['block-1']));

      expect(dataframes.has('gone')).toBe(false);
    });

    it('keeps a dataframe owned by a different, still-existing block', () => {
      const { service } = makeService();
      const { dataframes } = makeDataframesMap();
      dataframes.set('other', makeDataframe('other', { blockId: 'block-2' }));

      service.updateDataframesInMap(dataframes, [], 'block-1', new Set(['block-1', 'block-2']));

      expect(dataframes.has('other')).toBe(true);
    });

    it('never removes a dataframe with no blockId', () => {
      const { service } = makeService();
      const { dataframes } = makeDataframesMap();
      dataframes.set('untracked', makeDataframe('untracked', { blockId: undefined }));

      service.updateDataframesInMap(dataframes, [], 'block-1', new Set(['block-1']));

      expect(dataframes.has('untracked')).toBe(true);
    });
  });

  describe('updateDataframes', () => {
    it('lists dataframes from the python session and syncs them into the map', async () => {
      const list = jest.fn().mockResolvedValue([makeDataframe('df1', { blockId: undefined })]);
      const { service } = makeService({ list });
      const { dataframes } = makeDataframesMap();

      await service.updateDataframes(
        { workspaceId: 'ws-1', sessionId: 'sess-1' },
        'block-1',
        new Set(['block-1']),
        dataframes,
      );

      expect(list).toHaveBeenCalledWith({ workspaceId: 'ws-1', sessionId: 'sess-1' });
      expect(dataframes.get('df1')?.blockId).toBe('block-1');
    });

    it('logs and rethrows when listing dataframes fails', async () => {
      const err = new Error('kernel unreachable');
      const list = jest.fn().mockRejectedValue(err);
      const { service } = makeService({ list });
      const { dataframes } = makeDataframesMap();

      await expect(
        service.updateDataframes({ workspaceId: 'ws-1', sessionId: 'sess-1' }, 'block-1', new Set(), dataframes),
      ).rejects.toThrow('kernel unreachable');
    });
  });

  describe('renameDataframe', () => {
    it('renames a dataframe and preserves its data under the new key', () => {
      const { service } = makeService();
      const { dataframes } = makeDataframesMap();
      dataframes.set('old_name', makeDataframe('old_name', { blockId: 'block-1' }));

      const result = service.renameDataframe(dataframes, 'old_name', 'new_name');

      expect(result).toBe(true);
      expect(dataframes.has('old_name')).toBe(false);
      expect(dataframes.get('new_name')?.name).toBe('new_name');
      expect(dataframes.get('new_name')?.blockId).toBe('block-1');
    });

    it('returns false when the dataframe to rename does not exist', () => {
      const { service } = makeService();
      const { dataframes } = makeDataframesMap();

      expect(service.renameDataframe(dataframes, 'missing', 'new_name')).toBe(false);
    });

    it('returns false when the new name is already taken', () => {
      const { service } = makeService();
      const { dataframes } = makeDataframesMap();
      dataframes.set('a', makeDataframe('a'));
      dataframes.set('b', makeDataframe('b'));

      expect(service.renameDataframe(dataframes, 'a', 'b')).toBe(false);
      expect(dataframes.has('a')).toBe(true);
    });
  });

  describe('deleteDataframe', () => {
    it('deletes an existing dataframe and returns true', () => {
      const { service } = makeService();
      const { dataframes } = makeDataframesMap();
      dataframes.set('df1', makeDataframe('df1'));

      expect(service.deleteDataframe(dataframes, 'df1')).toBe(true);
      expect(dataframes.has('df1')).toBe(false);
    });

    it('returns false when the dataframe does not exist', () => {
      const { service } = makeService();
      const { dataframes } = makeDataframesMap();

      expect(service.deleteDataframe(dataframes, 'missing')).toBe(false);
    });
  });

  describe('clearAllDataframes', () => {
    it('removes every dataframe from the map', () => {
      const { service } = makeService();
      const { dataframes } = makeDataframesMap();
      dataframes.set('a', makeDataframe('a'));
      dataframes.set('b', makeDataframe('b'));

      service.clearAllDataframes(dataframes);

      expect(dataframes.size).toBe(0);
    });
  });

  describe('read helpers', () => {
    it('getDataframe/hasDataframe/getDataframeNames/getAllDataframes/getDataframesByBlock', () => {
      const { service } = makeService();
      const { dataframes } = makeDataframesMap();
      dataframes.set('a', makeDataframe('a', { blockId: 'block-1' }));
      dataframes.set('b', makeDataframe('b', { blockId: 'block-2' }));

      expect(service.getDataframe(dataframes, 'a')?.name).toBe('a');
      expect(service.hasDataframe(dataframes, 'b')).toBe(true);
      expect(service.hasDataframe(dataframes, 'missing')).toBe(false);
      expect(service.getDataframeNames(dataframes).sort()).toEqual(['a', 'b']);
      expect(service.getAllDataframes(dataframes)).toHaveLength(2);
      expect(service.getDataframesByBlock(dataframes, 'block-1')).toEqual([
        expect.objectContaining({ name: 'a' }),
      ]);
    });
  });

  describe('isValidDataframeName', () => {
    it('accepts a valid identifier', () => {
      const { service } = makeService();
      expect(service.isValidDataframeName('my_df_1')).toBe(true);
    });

    it('rejects a name starting with a digit', () => {
      const { service } = makeService();
      expect(service.isValidDataframeName('1_bad')).toBe(false);
    });
  });
});
