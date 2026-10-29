import type { BatchResult } from "@forge/kvs";
import { vi } from "vitest";
import { defaultConfig } from "../../src/lib/config";
import type { ImportManifest } from "../../src/lib/kv-data";
import type { UserAsset } from "../../src/lib/reference-assets";
import { emptyCounts, type ReferenceRun } from "../../src/lib/reference-types";

const clone = <T>(value: T): T =>
  value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T);

const values = new Map<string, unknown>();

const queryKeys = new Map<string, string[]>();

const invalidate = (key: string) => {
  for (const prefix of queryKeys.keys())
    if (key.startsWith(prefix)) queryKeys.delete(prefix);
};

const metrics = {
  bytesRead: 0,
  bytesWritten: 0,
  queriedKeys: [] as string[],
  requests: 0,
};

const read = (key: string) => {
  const value = values.get(key);
  metrics.bytesRead += Buffer.byteLength(JSON.stringify(value) ?? "");
  return clone(value);
};

const write = (
  key: string,
  value: unknown,
  options?: { keyPolicy?: string },
) => {
  if (options?.keyPolicy === "FAIL_IF_EXISTS" && values.has(key))
    throw new Error("KEY_EXISTS");
  if (!values.has(key)) invalidate(key);
  metrics.bytesWritten += Buffer.byteLength(JSON.stringify(value));
  values.set(key, clone(value));
};

const api = {
  batchDelete: vi.fn(async (keys: { key: string }[]): Promise<BatchResult> => {
    metrics.requests++;
    for (const { key } of keys) {
      values.delete(key);
      invalidate(key);
    }
    return { failedKeys: [], successfulKeys: keys };
  }),
  batchGet: vi.fn(async (keys: { key: string }[]) => {
    metrics.requests++;
    return {
      failedKeys: keys
        .filter(({ key }) => !values.has(key))
        .map(({ key }) => ({
          error: { code: "KEY_NOT_FOUND", message: "Missing" },
          key,
        })),
      successfulKeys: keys
        .filter(({ key }) => values.has(key))
        .map(({ key }) => ({ key, value: read(key) })),
    };
  }),
  batchSet: vi.fn(
    async (items: { key: string; value: unknown }[]): Promise<BatchResult> => {
      metrics.requests++;
      for (const { key, value } of items) write(key, value);
      return {
        failedKeys: [],
        successfulKeys: items.map(({ key }) => ({ key })),
      };
    },
  ),
  get: vi.fn(async (key: string) => {
    metrics.requests++;
    return read(key);
  }),
  query: vi.fn(() => {
    let prefix = "";
    let after = "";
    const builder = {
      cursor(cursor: string) {
        after = cursor;
        return builder;
      },
      async getMany() {
        metrics.requests++;
        let keys = queryKeys.get(prefix);
        if (!keys) {
          keys = [...values.keys()]
            .filter((key) => key.startsWith(prefix))
            .sort();
          queryKeys.set(prefix, keys);
        }
        let start = 0;
        let end = keys.length;
        while (start < end) {
          const middle = (start + end) >>> 1;
          if ((keys[middle] ?? "") <= after) start = middle + 1;
          else end = middle;
        }
        const page = keys.slice(start, start + 20);
        metrics.queriedKeys.push(...page);
        return {
          nextCursor: keys.length > start + 20 ? page.at(-1) : undefined,
          results: page.map((key) => ({ key, value: read(key) })),
        };
      },
      where(_property: string, condition: string) {
        prefix = condition;
        return builder;
      },
    };
    return builder;
  }),
  set: vi.fn(
    async (key: string, value: unknown, options?: { keyPolicy?: string }) => {
      metrics.requests++;
      write(key, value, options);
    },
  ),
};

const implementations = { ...api };

const defaults = Object.fromEntries(
  Object.entries(api).map(([name, mock]) => [
    name,
    mock.getMockImplementation(),
  ]),
);

export const storage = {
  api,
  metrics,
  reset() {
    values.clear();
    queryKeys.clear();
    metrics.bytesRead = 0;
    metrics.bytesWritten = 0;
    metrics.queriedKeys = [];
    metrics.requests = 0;
    for (const name of Object.keys(implementations) as (keyof typeof api)[]) {
      api[name].mockReset().mockImplementation(defaults[name] as never);
    }
  },
  values,
};

export const fixtureScope = {
  importSourceId: "source",
  testing: true,
  workspaceId: "workspace",
};

export const fixtureSchema = {
  activeAttributeId: "2",
  emailAttributeId: "3",
  objectTypeId: "10",
  userAttributeId: "4",
};

export const fixtureUpload: ImportManifest = {
  data: [{ key: "chunk-0" }],
  testing: true,
  timestamp: "2026-10-28T12:00:00.000Z",
  totals: { keys: 1, records: 1 },
  uploadId: "upload",
};

export function makeRun(overrides: Partial<ReferenceRun> = {}): ReferenceRun {
  return {
    ...fixtureScope,
    aggregation: {
      counts: emptyCounts(),
      offset: 0,
      page: 0,
      reasons: {},
      total: 0,
    },
    aqlStart: 0,
    discovery: "aql",
    executionId: "execution",
    failures: 0,
    id: "2026-10-28T12:00:00.000Z:run",
    index: 0,
    inputChunks: fixtureUpload.totals.keys,
    inputRecords: fixtureUpload.totals.records,
    inventoryPages: 0,
    nativeTerminal: true,
    phase: "discovery",
    processingOffset: 0,
    processingPage: 0,
    requestedAt: "2026-10-28T12:00:00.000Z",
    schema: fixtureSchema,
    selected: 0,
    selectionStartedAt: "2026-10-28T12:00:00.000Z",
    startedAt: "2026-10-28T12:00:00.000Z",
    tuning: { ...defaultConfig.tuning },
    uploadId: "upload",
    ...overrides,
  };
}

export function makeAsset(
  id: string,
  options: { active?: unknown; email?: unknown; reference?: string } = {},
): UserAsset {
  return {
    attributes: [
      {
        objectAttributeValues: [{ value: options.active ?? true }],
        objectTypeAttributeId: "2",
      },
      {
        objectAttributeValues: [
          { value: options.email ?? "someone@example.test" },
        ],
        objectTypeAttributeId: "3",
      },
      {
        objectAttributeValues: options.reference
          ? [{ user: { key: options.reference } }]
          : [],
        objectTypeAttributeId: "4",
      },
    ],
    id,
    objectKey: `ASSET-${id}`,
    objectType: { id: "10" },
  } as unknown as UserAsset;
}
