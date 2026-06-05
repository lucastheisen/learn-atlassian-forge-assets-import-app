import { type ListResult, WhereConditions } from '@forge/api';
import { resetTranslationsCache } from '@forge/api/out/api/i18n';
import { BeginsWithClause, kvs } from '@forge/kvs';

const manifestBase = 'import:manifest:';

export interface ImportManifest {
  data: ImportManifestData[]
  // this is a string because it get serialized to/from json both in the kvs
  // and when added to the consumer Queue, so rather than fight to convert it
  // back and forth at each location, we just use string and force any consumer
  // that needs Date to create it where needed.
  timestamp: string
  totals: ImportManifestTotals
}

export interface ImportManifestData {
  key: string
}

export interface ImportManifestTotals {
  keys: number
  records: number
}

interface KeyValue<TKey, TValue> {
  key: TKey
  value: TValue
}

export const getData = async (
  manifest: ImportManifest,
  index: number
): Promise<object | undefined> => {
  const key = manifest.data[index]?.key;
  if (key === undefined) {
    return undefined;
  }
  return await kvs.get<object>(key);
}

export const getLatestManifest = async (): Promise<ImportManifest | undefined> => {
  let latest: ImportManifest | undefined = undefined;
  for await (const {value: manifest} of iterateManifests()) {
    if (latest === undefined || manifest.timestamp > latest.timestamp) {
      latest = manifest
    }
  }
  return latest;
}

async function* iterateManifests(): AsyncGenerator<KeyValue<string, ImportManifest>> {
  let cursor: string | undefined;

  do {
    const { results, nextCursor } = await nextManifestPage(cursor);

    for (const result of results) {
      yield result;
    }

    cursor = nextCursor;
  } while (cursor !== undefined);
}

const nextManifestPage = async (cursor?: string): Promise<ListResult<ImportManifest>> => {
  const query = kvs
    .query()
    .where('key', WhereConditions.beginsWith(manifestBase) as BeginsWithClause);

  if (cursor === undefined) {
    return await query.getMany<ImportManifest>();
  }

  return await query.cursor(cursor).getMany<ImportManifest>();
};

export const prune = async (keepN = 0) => {
  const all: KeyValue<string, ImportManifest>[] = []
  for await (const manifest of iterateManifests()) {
    all.push(manifest)
  }

  const res = await kvs.batchDelete(
    all
      .sort((a, b) => b.value.timestamp.localeCompare(a.value.timestamp))
      .slice(Math.max(keepN, 0))
      .flatMap(({key, value}) => [{key}, ...value.data.map(({key}) => ({key}))]));
}
