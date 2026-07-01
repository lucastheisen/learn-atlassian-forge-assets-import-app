import { beforeEach, describe, expect, it, vi } from 'vitest';

import { deleteAllValues, getAllValues, iterateAllValues } from './kv-common';
import { kvs, WhereConditions } from '@forge/kvs';

vi.mock('@forge/kvs', () => ({
  kvs: {
    batchDelete: vi.fn(),
    query: vi.fn(),
  },
  WhereConditions: {
    beginsWith: vi.fn((value: string) => ({ type: 'beginsWith', value })),
  },
}));

describe('kv-common', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('deleteAllValues', () => {
    it('returns an empty batch result when given no keys', async () => {
      const result = await deleteAllValues([]);

      expect(result).toStrictEqual({
        successfulKeys: [],
        failedKeys: [],
      });
      expect(kvs.batchDelete).not.toHaveBeenCalled();
    });

    it('deletes a single batch of keys', async () => {
      vi.mocked(kvs.batchDelete).mockResolvedValue({
        successfulKeys: [{ key: 'a' }, { key: 'b' }],
        failedKeys: [],
      });

      const result = await deleteAllValues(['a', 'b']);

      expect(kvs.batchDelete).toHaveBeenCalledOnce();
      expect(kvs.batchDelete).toHaveBeenCalledWith([
        { key: 'a' },
        { key: 'b' },
      ]);
      expect(result).toStrictEqual({
        successfulKeys: [{ key: 'a' }, { key: 'b' }],
        failedKeys: [],
      });
    });

    it('splits deletes into batches of 25 and merges results', async () => {
      const keys = Array.from({ length: 26 }, (_, i) => `key-${i + 1}`);

      vi.mocked(kvs.batchDelete)
        .mockResolvedValueOnce({
          successfulKeys: keys.slice(0, 25).map((key) => ({ key })),
          failedKeys: [],
        })
        .mockResolvedValueOnce({
          successfulKeys: [],
          failedKeys: [
            {
              key: 'key-26',
              error: {
                code: 'SOME_ERROR',
                message: 'failed',
              },
            },
          ],
        });

      const result = await deleteAllValues(keys);

      expect(kvs.batchDelete).toHaveBeenCalledTimes(2);
      expect(kvs.batchDelete).toHaveBeenNthCalledWith(
        1,
        keys.slice(0, 25).map((key) => ({ key }))
      );
      expect(kvs.batchDelete).toHaveBeenNthCalledWith(
        2,
        [{ key: 'key-26' }]
      );

      expect(result).toStrictEqual({
        successfulKeys: keys.slice(0, 25).map((key) => ({ key })),
        failedKeys: [
          {
            key: 'key-26',
            error: {
              code: 'SOME_ERROR',
              message: 'failed',
            },
          },
        ],
      });
    });
  });

  describe('iterateAllValues', () => {
    it('yields results from a single page', async () => {
      const beginsWithClause = { type: 'beginsWith', value: 'prefix:' };
      vi.mocked(WhereConditions.beginsWith).mockReturnValue(beginsWithClause as any);

      const getMany = vi.fn().mockResolvedValue({
        results: [
          { key: 'prefix:1', value: 1 },
          { key: 'prefix:2', value: 2 },
        ],
        nextCursor: undefined,
      });

      const where = vi.fn().mockReturnValue({ getMany });
      vi.mocked(kvs.query).mockReturnValue({ where } as any);

      const results = [];
      for await (const value of iterateAllValues<number>('prefix:')) {
        results.push(value);
      }

      expect(results).toStrictEqual([
        { key: 'prefix:1', value: 1 },
        { key: 'prefix:2', value: 2 },
      ]);
      expect(WhereConditions.beginsWith).toHaveBeenCalledWith('prefix:');
      expect(kvs.query).toHaveBeenCalledOnce();
      expect(where).toHaveBeenCalledWith('key', beginsWithClause);
      expect(getMany).toHaveBeenCalledOnce();
    });

    it('follows pagination cursors across multiple pages', async () => {
      const beginsWithClause = { type: 'beginsWith', value: 'prefix:' };
      vi.mocked(WhereConditions.beginsWith).mockReturnValue(beginsWithClause as any);

      const firstGetMany = vi.fn().mockResolvedValue({
        results: [
          { key: 'prefix:1', value: 1 },
          { key: 'prefix:2', value: 2 },
        ],
        nextCursor: 'cursor-1',
      });

      const secondGetMany = vi.fn().mockResolvedValue({
        results: [
          { key: 'prefix:3', value: 3 },
        ],
        nextCursor: undefined,
      });

      const firstWhere = vi.fn().mockReturnValue({
        getMany: firstGetMany,
      });

      const secondCursor = vi.fn().mockReturnValue({
        getMany: secondGetMany,
      });

      const secondWhere = vi.fn().mockReturnValue({
        cursor: secondCursor,
      });

      vi.mocked(kvs.query)
        .mockReturnValueOnce({ where: firstWhere } as any)
        .mockReturnValueOnce({ where: secondWhere } as any);

      const results = [];
      for await (const value of iterateAllValues<number>('prefix:')) {
        results.push(value);
      }

      expect(results).toStrictEqual([
        { key: 'prefix:1', value: 1 },
        { key: 'prefix:2', value: 2 },
        { key: 'prefix:3', value: 3 },
      ]);

      expect(WhereConditions.beginsWith).toHaveBeenCalledTimes(2);
      expect(WhereConditions.beginsWith).toHaveBeenNthCalledWith(1, 'prefix:');
      expect(WhereConditions.beginsWith).toHaveBeenNthCalledWith(2, 'prefix:');

      expect(kvs.query).toHaveBeenCalledTimes(2);

      expect(firstWhere).toHaveBeenCalledWith('key', beginsWithClause);
      expect(firstGetMany).toHaveBeenCalledOnce();

      expect(secondWhere).toHaveBeenCalledWith('key', beginsWithClause);
      expect(secondCursor).toHaveBeenCalledWith('cursor-1');
      expect(secondGetMany).toHaveBeenCalledOnce();
    });
  });

  describe('getAllValues', () => {
    it('collects all values from all pages', async () => {
      const beginsWithClause = { type: 'beginsWith', value: 'prefix:' };
      vi.mocked(WhereConditions.beginsWith).mockReturnValue(beginsWithClause as any);

      const firstGetMany = vi.fn().mockResolvedValue({
        results: [
          { key: 'prefix:1', value: 1 },
        ],
        nextCursor: 'cursor-1',
      });

      const secondGetMany = vi.fn().mockResolvedValue({
        results: [
          { key: 'prefix:2', value: 2 },
          { key: 'prefix:3', value: 3 },
        ],
        nextCursor: undefined,
      });

      const firstWhere = vi.fn().mockReturnValue({
        getMany: firstGetMany,
      });

      const secondCursor = vi.fn().mockReturnValue({
        getMany: secondGetMany,
      });

      const secondWhere = vi.fn().mockReturnValue({
        cursor: secondCursor,
      });

      vi.mocked(kvs.query)
        .mockReturnValueOnce({ where: firstWhere } as any)
        .mockReturnValueOnce({ where: secondWhere } as any);

      const results = await getAllValues<number>('prefix:');

      expect(results).toStrictEqual([
        { key: 'prefix:1', value: 1 },
        { key: 'prefix:2', value: 2 },
        { key: 'prefix:3', value: 3 },
      ]);
    });
  });
});
