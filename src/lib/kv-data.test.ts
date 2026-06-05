import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WhereConditions } from '@forge/api';
import { kvs } from '@forge/kvs';

import { getLatestManifest } from './kv-data';

vi.mock('@forge/api', () => ({
  WhereConditions: {
    beginsWith: vi.fn((value: string) => ({ type: 'beginsWith', value })),
  },
}));

vi.mock('@forge/kvs', () => ({
  kvs: {
    query: vi.fn(),
  },
  BeginsWithClause: class BeginsWithClause {},
}));

describe('getLatestManifest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns undefined when kvs returns no manifests', async () => {
    const beginsWithClause = { type: 'beginsWith', value: 'import:manifest:' };
    vi.mocked(WhereConditions.beginsWith).mockReturnValue(beginsWithClause as any);

    const getMany = vi.fn().mockResolvedValue({
      results: [],
    });
    const where = vi.fn().mockReturnValue({ getMany });

    vi.mocked(kvs.query).mockReturnValue({ where } as any);

    const result = await getLatestManifest();

    expect(result).toBeUndefined();
    expect(WhereConditions.beginsWith).toHaveBeenCalledWith('import:manifest:');
    expect(kvs.query).toHaveBeenCalledOnce();
    expect(where).toHaveBeenCalledWith('key', beginsWithClause);
    expect(getMany).toHaveBeenCalledOnce();
  });

  it('queries kvs and returns the most recent manifest', async () => {
    const older = {
      data: [{ key: 'old' }],
      timestamp: '2024-01-01T00:00:00.000Z',
      totals: {
        keys: 1,
        records: 10,
      },
    };

    const newer = {
      data: [{ key: 'new' }, { key: 'new2' }],
      timestamp: '2024-02-01T00:00:00.000Z',
      totals: {
        keys: 2,
        records: 20,
      },
    };

    const beginsWithClause = { type: 'beginsWith', value: 'import:manifest:' };
    vi.mocked(WhereConditions.beginsWith).mockReturnValue(beginsWithClause as any);

    const getMany = vi.fn().mockResolvedValue({
      results: [
        { value: older },
        { value: newer },
      ],
    });
    const where = vi.fn().mockReturnValue({ getMany });

    vi.mocked(kvs.query).mockReturnValue({ where } as any);

    const result = await getLatestManifest();

    expect(result).toBeDefined();
    expect(result?.timestamp).toBe('2024-02-01T00:00:00.000Z');
    expect(result?.data).toEqual([{ key: 'new' }, { key: 'new2' }]);
    expect(result?.totals).toEqual({ keys: 2, records: 20 });

    expect(WhereConditions.beginsWith).toHaveBeenCalledWith('import:manifest:');
    expect(kvs.query).toHaveBeenCalledOnce();
    expect(where).toHaveBeenCalledWith('key', beginsWithClause);
    expect(getMany).toHaveBeenCalledOnce();
  });

  it('follows pagination cursors and returns the most recent manifest across pages', async () => {
    const oldest = {
      data: [{ key: 'oldest' }],
      timestamp: '2024-01-01T00:00:00.000Z',
      totals: {
        keys: 1,
        records: 10,
      },
    };

    const middle = {
      data: [{ key: 'middle' }],
      timestamp: '2024-02-01T00:00:00.000Z',
      totals: {
        keys: 1,
        records: 20,
      },
    };

    const newest = {
      data: [{ key: 'newest' }, { key: 'newest2' }],
      timestamp: '2024-03-01T00:00:00.000Z',
      totals: {
        keys: 2,
        records: 30,
      },
    };

    const beginsWithClause = { type: 'beginsWith', value: 'import:manifest:' };
    vi.mocked(WhereConditions.beginsWith).mockReturnValue(beginsWithClause as any);

    const getManyFirstPage = vi.fn().mockResolvedValue({
      results: [
        { value: oldest },
        { value: middle },
      ],
      nextCursor: 'cursor-1',
    });

    const getManySecondPage = vi.fn().mockResolvedValue({
      results: [
        { value: newest },
      ],
      nextCursor: undefined,
    });

    const cursor = vi.fn().mockReturnValue({
      getMany: getManySecondPage,
    });

    const where = vi.fn().mockReturnValue({
      getMany: getManyFirstPage,
      cursor,
    });

    vi.mocked(kvs.query).mockReturnValue({ where } as any);

    const result = await getLatestManifest();

    expect(result).toBeDefined();
    expect(result?.timestamp).toBe('2024-03-01T00:00:00.000Z');
    expect(result?.data).toEqual([{ key: 'newest' }, { key: 'newest2' }]);
    expect(result?.totals).toEqual({ keys: 2, records: 30 });

    expect(WhereConditions.beginsWith).toHaveBeenCalledWith('import:manifest:');
    expect(kvs.query).toHaveBeenCalledTimes(2);
    expect(where).toHaveBeenCalledTimes(2);
    expect(where).toHaveBeenNthCalledWith(1, 'key', beginsWithClause);
    expect(where).toHaveBeenNthCalledWith(2, 'key', beginsWithClause);

    expect(getManyFirstPage).toHaveBeenCalledOnce();
    expect(cursor).toHaveBeenCalledOnce();
    expect(cursor).toHaveBeenCalledWith('cursor-1');
    expect(getManySecondPage).toHaveBeenCalledOnce();
  });
});
