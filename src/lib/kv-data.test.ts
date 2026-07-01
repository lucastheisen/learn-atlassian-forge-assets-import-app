import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ImportManifest } from './kv-data';
import { getLatestManifest } from './kv-data';
import { iterateAllValues } from './kv-common';

vi.mock('./kv-common', () => ({
  deleteAllValues: vi.fn(),
  getAllValues: vi.fn(),
  iterateAllValues: vi.fn(),
}));

const asAsyncGenerator = async function* <T>(values: T[]): AsyncGenerator<T> {
  for (const value of values) {
    yield value;
  }
};

const manifest = (
  timestamp: string,
  data: { key: string }[] = [],
  totals = { keys: data.length, records: data.length * 10 },
): ImportManifest => ({
  data,
  timestamp,
  totals,
});

describe('getLatestManifest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns undefined when no manifests exist', async () => {
    vi.mocked(iterateAllValues).mockReturnValue(asAsyncGenerator([]));

    const result = await getLatestManifest();

    expect(result).toBeUndefined();
    expect(iterateAllValues).toHaveBeenCalledOnce();
    expect(iterateAllValues).toHaveBeenCalledWith('import:manifest:');
  });

  it('returns the most recent manifest', async () => {
    const older = manifest(
      '2024-01-01T00:00:00.000Z',
      [{ key: 'old' }],
      { keys: 1, records: 10 },
    );

    const newer = manifest(
      '2024-02-01T00:00:00.000Z',
      [{ key: 'new' }, { key: 'new2' }],
      { keys: 2, records: 20 },
    );

    vi.mocked(iterateAllValues).mockReturnValue(
      asAsyncGenerator([
        { key: 'import:manifest:2024-01-01T00:00:00.000Z:manifest', value: older },
        { key: 'import:manifest:2024-02-01T00:00:00.000Z:manifest', value: newer },
      ]),
    );

    const result = await getLatestManifest();

    expect(result).toEqual(newer);
    expect(iterateAllValues).toHaveBeenCalledOnce();
    expect(iterateAllValues).toHaveBeenCalledWith('import:manifest:');
  });

  it('returns the newest manifest even when yielded out of order', async () => {
    const oldest = manifest(
      '2024-01-01T00:00:00.000Z',
      [{ key: 'oldest' }],
      { keys: 1, records: 10 },
    );

    const middle = manifest(
      '2024-02-01T00:00:00.000Z',
      [{ key: 'middle' }],
      { keys: 1, records: 20 },
    );

    const newest = manifest(
      '2024-03-01T00:00:00.000Z',
      [{ key: 'newest' }, { key: 'newest2' }],
      { keys: 2, records: 30 },
    );

    vi.mocked(iterateAllValues).mockReturnValue(
      asAsyncGenerator([
        { key: 'import:manifest:2024-02-01T00:00:00.000Z:manifest', value: middle },
        { key: 'import:manifest:2024-01-01T00:00:00.000Z:manifest', value: oldest },
        { key: 'import:manifest:2024-03-01T00:00:00.000Z:manifest', value: newest },
      ]),
    );

    const result = await getLatestManifest();

    expect(result).toEqual(newest);
    expect(iterateAllValues).toHaveBeenCalledOnce();
    expect(iterateAllValues).toHaveBeenCalledWith('import:manifest:');
  });
});
