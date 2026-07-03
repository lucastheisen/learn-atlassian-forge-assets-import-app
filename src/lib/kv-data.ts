import { kvs } from "@forge/kvs";
import { deleteAllValues, getAllValues, iterateAllValues } from "./kv-common";
import { DataAccessError } from "./errors";

// test uploads are segregated into their own key prefix rather than tagged
// with a flag that production reads would need to remember to filter by, so
// getLatestManifest() (consumed by the real Forge import lifecycle in
// resolvers/index.ts) can never see test data, by construction.
export const importManifestPrefix = (testing: boolean): string =>
  testing ? "import:test-manifest:" : "import:manifest:";

export const importManifestKey = (timestamp: string, testing: boolean): string =>
  `${importManifestPrefix(testing)}${timestamp}:manifest`;

export interface ImportManifest {
  uploadId: string;
  testing: boolean;
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

// Import data is arbitrary caller-supplied JSON, opaque to this code — its
// real shape is defined entirely by whatever mapping/selector is configured
// for this import, not by anything this app validates or assumes.
export const getImportData = async (
  manifest: ImportManifest,
  index: number,
): Promise<Record<string, unknown> | undefined> => {
  const key = manifest.data[index]?.key;
  if (key === undefined) {
    return undefined;
  }

  try {
    return await kvs.get<Record<string, unknown>>(key);
  } catch (err) {
    throw new DataAccessError(
      "KVS_GET_IMPORT_DATA_FAILED",
      "Failed to load import data from KVS",
      {
        cause: err,
        details: {
          index,
          key,
          timestamp: manifest.timestamp,
        },
      },
    );
  }
};

const latestManifest = async (prefix: string): Promise<ImportManifest | undefined> => {
  let latest: ImportManifest | undefined = undefined;
  for await (const { value: manifest } of iterateAllValues<ImportManifest>(prefix)) {
    if (latest === undefined || manifest.timestamp > latest.timestamp) {
      latest = manifest;
    }
  }
  return latest;
};

export const getLatestManifest = (): Promise<ImportManifest | undefined> =>
  latestManifest(importManifestPrefix(false));

export const getLatestTestManifest = (): Promise<ImportManifest | undefined> =>
  latestManifest(importManifestPrefix(true));

export const prune = async (keepN = 0, testing = false): Promise<void> => {
  console.debug(`prune(${keepN}, testing=${testing})`);
  const all = await getAllValues<ImportManifest>(importManifestPrefix(testing));

  const keysToDelete = all
    .sort((a, b) => b.value.timestamp.localeCompare(a.value.timestamp))
    .slice(Math.max(keepN, 0))
    .flatMap(({ key, value }) => [key, ...value.data.map((item) => item.key)]);

  if (keysToDelete.length === 0) {
    console.debug("nothing to delete");
    return;
  }

  const res = await deleteAllValues(keysToDelete);
  console.debug("delete result: ", res);
};
