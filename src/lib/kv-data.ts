import { kvs } from '@forge/kvs';
import { deleteAllValues, getAllValues, iterateAllValues } from './kv-common';

const manifestBase = 'import:manifest:';

export interface ImportManifest {
  data: ImportManifestData[];
  // this is a string because it get serialized to/from json both in the kvs
  // and when added to the consumer Queue, so rather than fight to convert it
  // back and forth at each location, we just use string and force any consumer
  // that needs Date to create it where needed.
  timestamp: string;
  totals: ImportManifestTotals;
}

export interface ImportManifestData {
  key: string;
}

export interface ImportManifestTotals {
  keys: number;
  records: number;
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
};

export const getLatestManifest = async (): Promise<ImportManifest | undefined> => {
  let latest: ImportManifest | undefined = undefined;
  for await (const { value: manifest } of iterateAllValues<ImportManifest>(manifestBase)) {
    if (latest === undefined || manifest.timestamp > latest.timestamp) {
      latest = manifest;
    }
  }
  return latest;
};

export const prune = async (keepN = 0): Promise<void> => {
  console.debug(`prune(${keepN})`);
  const all = await getAllValues<ImportManifest>(manifestBase);

  const keysToDelete = all
    .sort((a, b) => b.value.timestamp.localeCompare(a.value.timestamp))
    .slice(Math.max(keepN, 0))
    .flatMap(({key, value}) => [key, ...value.data.map((item) => item.key)]);

  if (keysToDelete.length === 0) {
    console.debug('nothing to delete');
    return;
  }

  const res = await deleteAllValues(keysToDelete);
  console.debug('delete result: ', res);
};
