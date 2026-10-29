import { createHash } from "node:crypto";
import { kvs } from "@forge/kvs";
import { DataAccessError } from "./errors";
import { deleteAllValues, getValue, nextPage, setValue } from "./kv-common";
import type { ImportManifest } from "./kv-data";
import {
  measureReferenceOperation,
  observeReferenceRun,
} from "./reference-metrics";
import type {
  InventoryPage,
  PendingReference,
  ProcessingBudget,
  ReferenceRun,
  ReferenceScope,
  RunSummary,
  WorkItem,
} from "./reference-types";

export const activeRunKey = "user-reference:active";

export const cancellationKey = (scope: ReferenceScope) =>
  `${referenceRoot(scope.testing)}cancel:${scopeKey(scope)}`;

export const deletionKey = (scope: ReferenceScope) =>
  `${deletionPrefix(scope.testing)}${scopeKey(scope)}`;

export const deletionPrefix = (testing: boolean) =>
  `${referenceRoot(testing)}deleted:`;

export const inventoryKey = (run: ReferenceRun, index: number) =>
  `${runPrefix(run)}inventory:${index}`;

export const inventoryMetaKey = (run: ReferenceRun, index: number) =>
  `${referenceRoot(run.testing)}page-meta:${scopeKey(run)}${run.id}:${index}`;

export const manifestPrefix = (scope: ReferenceScope) =>
  `${referenceRoot(scope.testing)}manifest:${scopeKey(scope)}`;

export const pendingKey = (run: ReferenceScope, assetId: string) =>
  `${pendingPrefix(run)}${createHash("sha256").update(assetId).digest("hex").slice(0, 2)}:${encodeURIComponent(assetId)}`;

export const pendingPartitionPrefix = (
  scope: ReferenceScope,
  partition: number,
) => `${pendingPrefix(scope)}${partition.toString(16).padStart(2, "0")}:`;

export const pendingPrefix = (scope: ReferenceScope) =>
  `${referenceRoot(scope.testing)}pending:${scopeKey(scope)}`;

export const recoveryKey = (scope: ReferenceScope) =>
  `${referenceRoot(scope.testing)}recovery:${scopeKey(scope)}`;

export const referenceRoot = (testing: boolean) =>
  `user-reference:${testing ? "test" : "live"}:`;

export const runKey = (run: ReferenceRun) => `${manifestPrefix(run)}${run.id}`;

export const runPrefix = (run: ReferenceRun) =>
  `${referenceRoot(run.testing)}run:${scopeKey(run)}${run.id}:`;

const scopeKey = (scope: ReferenceScope) =>
  `${encodeURIComponent(scope.workspaceId)}:${encodeURIComponent(scope.importSourceId)}:`;

export const summaryKey = (run: ReferenceRun) =>
  `${referenceRoot(run.testing)}summary:${scopeKey(run)}${run.executionId ?? run.id}`;

export const uploadKey = (run: ReferenceRun) => `${runPrefix(run)}upload`;

export const workKey = (run: ReferenceRun, assetId: string) =>
  `${runPrefix(run)}asset:${encodeURIComponent(assetId)}`;

export async function commitInventoryPage(
  run: ReferenceRun,
  page: InventoryPage,
  budget: ProcessingBudget,
): Promise<void> {
  const index = run.inventoryPages;
  const key = inventoryKey(run, index);
  if (!page.sealed) {
    await saveReferenceValue(key, page);
    await saveReferenceValue(inventoryMetaKey(run, index), {
      count: page.assetIds.length,
      index,
      key,
    });
    const owned: string[] = [];
    for (let offset = 0; offset < page.assetIds.length; offset += 25) {
      budget.check();
      const ids = page.assetIds.slice(offset, offset + 25);
      const existing = await readWorkItems(run, ids);
      await writeWorkItems(
        run,
        ids
          .filter((id) => !existing.has(id))
          .map((assetId) => ({
            assetId,
            attempts: 0,
            inventoryPage: index,
          })),
      );
      owned.push(
        ...ids.filter(
          (id) =>
            !existing.has(id) || existing.get(id)?.inventoryPage === index,
        ),
      );
    }
    page = { ...page, assetIds: owned, sealed: true };
    await saveReferenceValue(key, page);
  }
  await saveReferenceValue(inventoryMetaKey(run, index), {
    count: page.assetIds.length,
    index,
    key,
  });
  run.inventoryPages++;
  run.selected += page.assetIds.length;
  run.aqlStart = page.nextAqlStart;
  run.discovery = page.nextDiscovery;
  run.retryPartition = page.nextRetryPartition ?? run.retryPartition;
  await saveRun(run);
}

export async function deleteReferenceValues(keys: string[]): Promise<void> {
  const result = await deleteAllValues(keys);
  if (
    result.failedKeys.some(({ error }) => error.code !== "KEY_NOT_FOUND") ||
    new Set(
      [...result.successfulKeys, ...result.failedKeys].map(({ key }) => key),
    ).size !== keys.length
  ) {
    throw new DataAccessError(
      "KVS_DELETE_FAILED",
      "Reference cleanup is incomplete",
    );
  }
}

export async function persistSummary(run: ReferenceRun): Promise<RunSummary> {
  if (!run.completedAt) throw new Error("Run completion time is missing");
  const summary: RunSummary = {
    completedAt: run.completedAt,
    counts: run.aggregation.counts,
    detailsPrefix: `${runPrefix(run)}asset:`,
    durationMs:
      Date.parse(run.completedAt) -
      Date.parse(run.startedAt ?? run.requestedAt),
    executionId: run.executionId,
    failure: run.failure,
    importSourceId: run.importSourceId,
    phaseDurationsMs: {
      ...run.phaseDurationsMs,
      ...(run.timedPhase && run.phaseStartedAt !== undefined
        ? {
            [run.timedPhase]:
              (run.phaseDurationsMs?.[run.timedPhase] ?? 0) +
              Date.now() -
              run.phaseStartedAt,
          }
        : {}),
    },
    queueWaitMs:
      Date.parse(run.startedAt ?? run.requestedAt) -
      Date.parse(run.requestedAt),
    reasons: run.aggregation.reasons,
    retentionDurationMs: run.retentionDurationMs ?? 0,
    runId: run.id,
    selected: run.selected,
    selectionComplete: run.discovery === "sealed",
    startedAt: run.startedAt ?? run.requestedAt,
    status: run.failure
      ? "failed"
      : run.aggregation.counts.unresolved
        ? "with_errors"
        : "success",
    testing: run.testing,
    tuning: run.tuning,
    unfinished: run.selected - run.aggregation.total,
    workspaceId: run.workspaceId,
  };
  if (
    summary.unfinished < 0 ||
    (!run.failure && (summary.unfinished || !summary.selectionComplete))
  ) {
    throw new Error(
      "Cannot summarize incomplete reference processing as successful",
    );
  }
  if (Buffer.byteLength(JSON.stringify(summary)) > 240 * 1024)
    throw new Error("Reference summary exceeds the KVS value limit");
  await saveReferenceValue(summaryKey(run), summary);
  return summary;
}

export async function preserveRecoveryWindow(run: ReferenceRun): Promise<void> {
  const timestamp = run.selectionStartedAt ?? run.startedAt;
  if (!timestamp) return;
  const previous = await readReferenceValue<string>(recoveryKey(run));
  if (!previous || timestamp < previous)
    await saveReferenceValue(recoveryKey(run), timestamp);
}

export async function pruneReferenceRun(
  run: ReferenceRun,
  budget: ProcessingBudget,
): Promise<void> {
  for (let index = run.prunePage ?? 0; index <= run.inventoryPages; index++) {
    budget.check();
    const page = await readReferenceValue<InventoryPage>(
      inventoryKey(run, index),
    );
    if (!page && index < run.inventoryPages)
      throw new Error("Reference inventory required for pruning is missing");
    if (page) {
      for (
        let offset = run.pruneOffset ?? 0;
        offset < page.assetIds.length;
        offset += 25
      ) {
        budget.check();
        await deleteReferenceValues(
          page.assetIds
            .slice(offset, offset + 25)
            .map((id) => workKey(run, id)),
        );
        run.pruneOffset = offset + 25;
        await saveRun(run);
      }
    }
    run.prunePage = index + 1;
    run.pruneOffset = 0;
    await saveRun(run);
  }
  for (
    let index = run.pruneMetadata ?? 0;
    index <= run.inventoryPages;
    index++
  ) {
    budget.check();
    await deleteReferenceValues([
      inventoryKey(run, index),
      inventoryMetaKey(run, index),
    ]);
    run.pruneMetadata = index + 1;
    await saveRun(run);
  }
  await deleteReferenceValues([summaryKey(run), uploadKey(run)]);
  await deleteReferenceValues([runKey(run)]);
}

async function pruneRetainedRuns(
  run: ReferenceRun,
  budget: ProcessingBudget,
): Promise<void> {
  run.retention ??= {
    done: false,
    keep: [],
    pending: [],
    scanned: false,
  };
  const retention = run.retention;
  if (!retention.scanned) {
    const eligible: {
      key: string;
      phase: ReferenceRun["phase"];
      startedAt: string;
    }[] = [];
    let cursor: string | undefined;
    do {
      budget.check();
      const page = await nextPage<ReferenceRun>(manifestPrefix(run), cursor);
      eligible.push(
        ...page.results
          .filter(({ value }) => value.phase !== "queued")
          .map(({ key, value }) => ({
            key,
            phase: value.phase,
            startedAt: value.startedAt ?? value.requestedAt,
          })),
      );
      cursor = page.nextCursor;
    } while (cursor !== undefined);
    retention.keep = [
      { key: runKey(run), startedAt: run.startedAt ?? run.requestedAt },
      ...eligible
        .filter(({ key }) => key !== runKey(run))
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
        .slice(0, 2),
    ];
    const keep = new Set(retention.keep.map(({ key }) => key));
    const obsolete = eligible.filter(({ key }) => !keep.has(key));
    if (obsolete.some(({ phase }) => phase !== "complete"))
      throw new Error("Cannot prune unfinished reference processing");
    retention.pending = obsolete.map(({ key }) => key);
    retention.scanned = true;
    await saveRun(run);
  }
  while (retention.pending.length) {
    budget.check();
    const key = retention.pending[0];
    if (!key) throw new Error("Reference retention checkpoint is invalid");
    const old = await readReferenceValue<ReferenceRun>(key);
    if (old) await pruneReferenceRun(old, budget);
    retention.pending.shift();
    await saveRun(run);
  }
  retention.done = true;
  await saveRun(run);
}

export const readReferenceValue = <T>(key: string): Promise<T | undefined> =>
  getValue<T>(key, "read reference processing state");

export const readRunUpload = (
  run: ReferenceRun,
): Promise<ImportManifest | undefined> =>
  readReferenceValue<ImportManifest>(uploadKey(run));

export async function readWorkItems(
  run: ReferenceRun,
  ids: string[],
): Promise<Map<string, WorkItem>> {
  const values = new Map<string, WorkItem>();
  for (let offset = 0; offset < ids.length; offset += 25) {
    const keys = ids.slice(offset, offset + 25).map((id) => workKey(run, id));
    const result = await measureReferenceOperation("kvs.batchGet", () =>
      kvs.batchGet<WorkItem>(keys.map((key) => ({ key }))),
    );
    if (
      result.failedKeys.some(({ error }) => error.code !== "KEY_NOT_FOUND") ||
      new Set(
        [...result.successfulKeys, ...result.failedKeys].map(({ key }) => key),
      ).size !== keys.length
    ) {
      throw new DataAccessError(
        "KVS_GET_FAILED",
        "Reference work batch read is incomplete",
      );
    }
    for (const { value } of result.successfulKeys)
      values.set(value.assetId, value);
  }
  return values;
}

export async function retainThreeRuns(
  run: ReferenceRun,
  budget: ProcessingBudget,
): Promise<void> {
  const startedAt = Date.now();
  try {
    await pruneRetainedRuns(run, budget);
  } finally {
    run.retentionDurationMs =
      (run.retentionDurationMs ?? 0) + Date.now() - startedAt;
    await saveRun(run);
  }
}

export const savePending = (run: ReferenceRun, item: WorkItem): Promise<void> =>
  saveReferenceValue<PendingReference>(pendingKey(run, item.assetId), {
    assetId: item.assetId,
    httpStatus: item.httpStatus,
    reason: item.reason,
    runId: run.id,
  });

export const saveReferenceValue = <T>(key: string, value: T): Promise<void> =>
  setValue(
    key,
    value,
    { keyPolicy: "OVERRIDE" },
    "persist reference processing state",
  );

export const saveRun = (run: ReferenceRun): Promise<void> => {
  observeReferenceRun(run);
  if (run.timedPhase !== run.phase) {
    if (run.timedPhase && run.phaseStartedAt !== undefined) {
      run.phaseDurationsMs ??= {};
      run.phaseDurationsMs[run.timedPhase] =
        (run.phaseDurationsMs[run.timedPhase] ?? 0) +
        Date.now() -
        run.phaseStartedAt;
    }
    run.timedPhase = run.phase;
    run.phaseStartedAt = Date.now();
  }
  return saveReferenceValue(runKey(run), run);
};

async function writeWorkItems(
  run: ReferenceRun,
  items: WorkItem[],
): Promise<void> {
  if (!items.length) return;
  const result = await measureReferenceOperation("kvs.batchSet", () =>
    kvs.batchSet(
      items.map((value) => ({ key: workKey(run, value.assetId), value })),
    ),
  );
  if (
    result.failedKeys.length ||
    result.successfulKeys.length !== items.length
  ) {
    throw new DataAccessError(
      "KVS_SET_FAILED",
      "Reference work batch write is incomplete",
    );
  }
}
