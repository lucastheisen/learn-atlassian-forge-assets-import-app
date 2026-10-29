import {
  type BatchResult,
  kvs,
  type ListResult,
  type PolicySetOptions,
  type Result,
  WhereConditions,
} from "@forge/kvs";
import { DataAccessError } from "./errors";
import { measureReferenceOperation } from "./reference-metrics";

// Per the documentation at
//   https://developer.atlassian.com/platform/forge/storage-reference/kvs-batch/#limitations
// batch operations are limited to 25 items.
const MAX_BATCH_KEYS = 25;

export async function deleteAllValues(keys: string[]): Promise<BatchResult> {
  const result: BatchResult = {
    failedKeys: [],
    successfulKeys: [],
  };

  if (keys.length === 0) {
    return result;
  }

  for (let i = 0; i < keys.length; i += MAX_BATCH_KEYS) {
    const batchKeys = keys.slice(i, i + MAX_BATCH_KEYS);

    let batchResult: BatchResult;
    try {
      batchResult = await measureReferenceOperation("kvs.batchDelete", () =>
        kvs.batchDelete(batchKeys.map((key) => ({ key }))),
      );
    } catch (err) {
      throw new DataAccessError(
        "KVS_BATCH_DELETE_FAILED",
        "Failed to delete KVS keys",
        {
          cause: err,
          details: { keys: batchKeys },
        },
      );
    }

    result.successfulKeys.push(...batchResult.successfulKeys);
    result.failedKeys.push(...batchResult.failedKeys);
  }

  return result;
}

export async function getAllValues<T>(prefix: string): Promise<Result<T>[]> {
  const all: Result<T>[] = [];
  for await (const value of iterateAllValues<T>(prefix)) {
    all.push(value);
  }
  return all;
}

export async function getValue<T>(
  key: string,
  operation: string,
): Promise<T | undefined> {
  try {
    return await measureReferenceOperation("kvs.get", () => kvs.get<T>(key));
  } catch (cause) {
    throw new DataAccessError("KVS_GET_FAILED", `Failed to ${operation}`, {
      cause,
      details: { key },
    });
  }
}

// uses function* here because generator functions cannot be defined using
// fat arrow syntax
export async function* iterateAllValues<T>(
  prefix: string,
): AsyncGenerator<Result<T>> {
  let cursor: string | undefined;

  do {
    const { results, nextCursor } = await nextPage<T>(prefix, cursor);

    for (const result of results) {
      yield result;
    }

    cursor = nextCursor;
  } while (cursor !== undefined);
}

export async function nextPage<T>(
  prefix: string,
  cursor?: string,
): Promise<ListResult<T>> {
  try {
    const query = kvs.query().where("key", WhereConditions.beginsWith(prefix));

    if (cursor === undefined) {
      return await measureReferenceOperation("kvs.query", () =>
        query.getMany<T>(),
      );
    }

    return await measureReferenceOperation("kvs.query", () =>
      query.cursor(cursor).getMany<T>(),
    );
  } catch (err) {
    throw new DataAccessError(
      "KVS_QUERY_FAILED",
      "Failed to query KVS values",
      {
        cause: err,
        details: { cursor, prefix },
      },
    );
  }
}

export async function setValue<T>(
  key: string,
  value: T,
  options: PolicySetOptions,
  operation: string,
): Promise<void> {
  try {
    await measureReferenceOperation("kvs.set", () =>
      kvs.set(key, value, options),
    );
  } catch (cause) {
    throw new DataAccessError("KVS_SET_FAILED", `Failed to ${operation}`, {
      cause,
      details: { key },
    });
  }
}
