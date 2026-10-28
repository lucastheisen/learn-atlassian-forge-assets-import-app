import { randomUUID } from "node:crypto";
import { route } from "@forge/api";
import type { AsyncEvent } from "@forge/events";
import { kvs } from "@forge/kvs";
import { AppError } from "./errors";
import { nextPage, setValue } from "./kv-common";
import { getImportData, type ImportManifest } from "./kv-data";
import {
  activeRunKey,
  cancellationKey,
  commitInventoryPage,
  deleteReferenceValues,
  deletionKey,
  deletionPrefix,
  inventoryKey,
  manifestPrefix,
  pendingPrefix,
  persistSummary,
  preserveRecoveryWindow,
  pruneReferenceRun,
  readReferenceValue,
  readRunUpload,
  recoveryKey,
  referenceRoot,
  retainThreeRuns,
  runKey,
  saveReferenceValue,
  saveRun,
  uploadKey,
} from "./kv-reference";
import { referenceRequest } from "./reference-api";
import {
  executionStatus,
  latestExecution,
  nativeSucceeded,
  resolveReferenceSchema,
} from "./reference-assets";
import {
  aggregateWork,
  discoverWork,
  processWork,
} from "./reference-processing";
import {
  type DeleteSourceEvent,
  importConcurrency,
  queueRun,
  queueSourceDeletion,
  queueWorker,
  type ReferenceEvent,
} from "./reference-queues";
import {
  ContinueLater,
  emptyCounts,
  type InventoryPage,
  ProcessingBudget,
  ProductRequestError,
  type ReferenceRun,
  type ReferenceScope,
  SchemaError,
  type UserLookup,
} from "./reference-types";
import { lookupUserByEmail } from "./user-lookup";

const NATIVE_TIMEOUT_MS = 30 * 60_000;
const RUN_TIMEOUT_MS = 2 * 60 * 60_000;
interface SourceDeletion extends ReferenceScope {
  finished: boolean;
}

export interface BeginImportParams extends ReferenceScope {
  manifest: ImportManifest;
}

export async function requestImport({
  manifest,
  ...scope
}: BeginImportParams): Promise<void> {
  if (await readReferenceValue(deletionKey(scope)))
    throw new Error("Import source was deleted");
  if (manifest.totals.keys < 1) throw new Error("Import has no data chunks");
  const requestedAt = new Date().toISOString();
  const run: ReferenceRun = {
    ...scope,
    aggregation: {
      counts: emptyCounts(),
      offset: 0,
      page: 0,
      reasons: {},
      total: 0,
    },
    aqlStart: 0,
    discovery: "aql",
    failures: 0,
    id: `${requestedAt}:${randomUUID()}`,
    index: 0,
    inventoryPages: 0,
    phase: "queued",
    processingOffset: 0,
    processingPage: 0,
    requestedAt,
    selected: 0,
    uploadId: manifest.uploadId,
  };
  await setValue(
    runKey(run),
    run,
    { keyPolicy: "FAIL_IF_EXISTS" },
    "create import request",
  );
  await saveReferenceValue(uploadKey(run), manifest);
  await queueRun(runKey(run));
}

export async function cancelImports(
  workspaceId: string,
  importSourceId: string,
  deleted = false,
): Promise<void> {
  for (const testing of [false, true]) {
    const scope = { importSourceId, testing, workspaceId };
    await saveReferenceValue(cancellationKey(scope), new Date().toISOString());
    if (deleted) {
      await saveReferenceValue<SourceDeletion>(deletionKey(scope), {
        ...scope,
        finished: false,
      });
      await queueSourceDeletion(scope);
    }
  }
  const active = await readReferenceValue<string>(activeRunKey);
  if (active) await queueRun(active);
}

async function claimRun(key: string): Promise<boolean> {
  try {
    await kvs.set(activeRunKey, key, { keyPolicy: "FAIL_IF_EXISTS" });
    return true;
  } catch (error) {
    const active = await readReferenceValue<string>(activeRunKey);
    if (active !== undefined) return active === key;
    throw error;
  }
}

async function startNative(
  run: ReferenceRun,
  budget: ProcessingBudget,
): Promise<void> {
  if (!run.retention?.done || run.retention.pending.length)
    await retainThreeRuns(run, budget);
  const latest = await latestExecution(run, budget);
  if (!run.startPrepared) {
    if (latest && ["INGESTING", "PROCESSING"].includes(latest.status))
      throw new ContinueLater(30);
    run.previousExecutionId = latest?.executionId;
    run.startPrepared = true;
    await saveRun(run);
  } else if (latest && latest.executionId !== run.previousExecutionId) {
    run.executionId = latest.executionId;
    run.phase = latest.status === "INGESTING" ? "ingesting" : "polling";
    await saveRun(run);
    return;
  }
  const result = await referenceRequest<{
    result: string;
    links: { submitProgress: string };
  }>(
    route`/jsm/assets/workspace/${run.workspaceId}/v1/importsource/${run.importSourceId}/executions`,
    budget,
    { method: "POST" },
  );
  const executionId =
    result.result === "success"
      ? new URL(result.links.submitProgress).pathname.match(
          /\/executions\/([^/]+)\//,
        )?.[1]
      : undefined;
  if (!executionId) throw new Error("Assets did not return an execution ID");
  run.executionId = executionId;
  run.phase = "ingesting";
  await saveRun(run);
}

export async function ingestChunk(
  run: ReferenceRun,
  budget: ProcessingBudget,
): Promise<void> {
  if (!run.executionId) throw new Error("Execution ID is missing");
  const status = await executionStatus(run, budget);
  if (status.status !== "INGESTING") {
    run.phase = "polling";
    await saveRun(run);
    return;
  }
  const manifest = await readRunUpload(run);
  if (!manifest) throw new Error("Import upload manifest is missing");
  const data = await getImportData(manifest, run.index);
  if (data === undefined) throw new Error("Import data chunk is missing");
  const lastBatch = run.index === manifest.totals.keys - 1;
  await referenceRequest(
    route`/jsm/assets/workspace/${run.workspaceId}/v1/importsource/${run.importSourceId}/executions/${run.executionId}/data`,
    budget,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientGeneratedId: `${run.id}:${run.index}`,
        completed: lastBatch,
        data,
      }),
    },
  );
  run.index++;
  if (lastBatch) run.phase = "polling";
  await saveRun(run);
  if (!lastBatch) {
    try {
      await referenceRequest(
        route`/jsm/assets/workspace/${run.workspaceId}/v1/importsource/${run.importSourceId}/executions/${run.executionId}/progress`,
        budget,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            objects: { processed: run.index, total: manifest.totals.keys },
          }),
        },
      );
    } catch {
      console.warn("Native import progress update failed", {
        executionId: run.executionId,
        index: run.index,
      });
    }
  }
}

async function pollNative(
  run: ReferenceRun,
  budget: ProcessingBudget,
): Promise<void> {
  if (!run.executionId) throw new Error("Execution ID is missing");
  const status = await executionStatus(run, budget);
  if (status.status === "CANCELLED" || status.status === "DONE") {
    run.nativeTerminal = true;
    if (status.status === "CANCELLED") run.failure ??= "cancelled";
    if (!nativeSucceeded(status)) run.failure ??= "native_failed";
    if (run.failure) {
      await preserveRecoveryWindow(run);
      run.phase = "aggregation";
    } else {
      run.schema = await resolveReferenceSchema(run, budget);
      const recovery = await readReferenceValue<string>(recoveryKey(run));
      if (!run.startedAt) throw new Error("Import start time is missing");
      run.selectionStartedAt =
        recovery && recovery < run.startedAt ? recovery : run.startedAt;
      run.phase = "discovery";
    }
    await saveRun(run);
    return;
  }
  if (
    Date.now() - Date.parse(run.startedAt ?? run.requestedAt) >
    NATIVE_TIMEOUT_MS
  )
    run.failure ??= "native_timeout";
  if (run.failure && status.status === "INGESTING") {
    await referenceRequest(
      route`/jsm/assets/workspace/${run.workspaceId}/v1/importsource/${run.importSourceId}/executions/${run.executionId}`,
      budget,
      { method: "DELETE" },
    );
  }
  await saveRun(run);
  throw new ContinueLater(run.failure ? 60 : 5);
}

async function finalizeRun(
  run: ReferenceRun,
  budget: ProcessingBudget,
): Promise<void> {
  if (!run.retention?.done || run.retention.pending.length)
    await retainThreeRuns(run, budget);
  if (run.failure) await preserveRecoveryWindow(run);
  run.completedAt ??= new Date().toISOString();
  await saveRun(run);
  const summary = await persistSummary(run);
  if (!run.failure) await deleteReferenceValues([recoveryKey(run)]);
  await deleteReferenceValues([uploadKey(run)]);
  if (run.failure === "source_deleted")
    await saveReferenceValue<SourceDeletion>(deletionKey(run), {
      importSourceId: run.importSourceId,
      testing: run.testing,
      workspaceId: run.workspaceId,
      finished: false,
    });
  run.phase = "complete";
  await saveRun(run);
  await deleteReferenceValues([activeRunKey]);
  if (run.failure === "source_deleted") await queueSourceDeletion(run);
  console.log("User reference processing complete", {
    counts: summary.counts,
    durationMs: summary.durationMs,
    executionId: run.executionId,
    phaseDurationsMs: summary.phaseDurationsMs,
    retentionDurationMs: summary.retentionDurationMs,
    failure: summary.failure,
    runId: run.id,
    selected: summary.selected,
    status: summary.status,
    unfinished: summary.unfinished,
  });
}

export async function advanceRun(
  key: string,
  worker = false,
  lookup: UserLookup = lookupUserByEmail,
  budget = new ProcessingBudget(),
): Promise<void> {
  let run = await readReferenceValue<ReferenceRun>(key);
  if (!run) return;
  if (run.phase === "complete") {
    if ((await readReferenceValue<string>(activeRunKey)) === key)
      await deleteReferenceValues([activeRunKey]);
    return;
  }
  if (!(await claimRun(key))) {
    await queueRun(key, 30);
    return;
  }
  try {
    const cancelledAt = await readReferenceValue<string>(cancellationKey(run));
    const deleted = await readReferenceValue(deletionKey(run));
    if (deleted) run.failure = "source_deleted";
    else if (cancelledAt && run.requestedAt <= cancelledAt)
      run.failure ??= "cancelled";
    if (
      run.startedAt &&
      Date.now() - Date.parse(run.startedAt) > RUN_TIMEOUT_MS
    )
      run.failure ??= "processing_failed";
    if (
      run.deferredUntil &&
      Date.now() < run.deferredUntil &&
      !(run.failure && run.nativeTerminal)
    ) {
      await queueRun(key, Math.ceil((run.deferredUntil - Date.now()) / 1000));
      return;
    }
    run.deferredUntil = undefined;
    if (
      run.failure &&
      run.phase !== "aggregation" &&
      run.phase !== "finalizing"
    ) {
      if (run.phase === "starting" && run.startPrepared && !run.executionId) {
        const latest = await latestExecution(run, budget);
        if (latest && latest.executionId !== run.previousExecutionId)
          run.executionId = latest.executionId;
      }
      if (run.executionId && !run.nativeTerminal) run.phase = "polling";
      else {
        run.nativeTerminal = true;
        const page = await readReferenceValue<InventoryPage>(
          inventoryKey(run, run.inventoryPages),
        );
        if (page) await commitInventoryPage(run, page, budget);
        await preserveRecoveryWindow(run);
        run.phase = "aggregation";
      }
      await saveRun(run);
    }
    if (run.phase === "queued") {
      const upload = await readRunUpload(run);
      if (!upload) throw new Error("Queued import manifest is missing");
      run.startedAt = new Date().toISOString();
      run.phase = "starting";
      await saveRun(run);
    }
    if (run.phase === "starting") await startNative(run, budget);
    if (run.phase === "ingesting" && worker) await ingestChunk(run, budget);
    else if (run.phase === "polling") await pollNative(run, budget);
    if (run.phase === "discovery") await discoverWork(run, budget);
    if (run.phase === "processing") await processWork(run, lookup, budget);
    if (run.phase === "aggregation") await aggregateWork(run, budget);
    if (run.phase === "finalizing") {
      await finalizeRun(run, budget);
      return;
    }
  } catch (error) {
    if (error instanceof ContinueLater) {
      run = (await readReferenceValue<ReferenceRun>(key)) ?? run;
      run.deferredUntil = Date.now() + error.delaySeconds * 1000;
      await saveRun(run);
      await queueRun(key, error.delaySeconds);
      return;
    }
    // Reload committed counters/checkpoints rather than saving partially computed aggregation.
    run = (await readReferenceValue<ReferenceRun>(key)) ?? run;
    run.failures++;
    console.warn("Import lifecycle step failed", {
      executionId: run.executionId,
      phase: run.phase,
      runId: run.id,
      failures: run.failures,
      errorCode:
        error instanceof AppError
          ? error.code
          : error instanceof SchemaError
            ? "schema_invalid"
            : "unexpected",
      httpStatus:
        error instanceof ProductRequestError ? error.status : undefined,
    });
    if (error instanceof SchemaError) run.failure = "schema_invalid";
    if (error instanceof ProductRequestError && error.status === 404) {
      run.failure ??= "native_failed";
      run.nativeTerminal = true;
    }
    if (run.failures >= 5)
      run.failure ??=
        run.phase === "discovery" ? "discovery_failed" : "processing_failed";
    if (run.failure && (!run.executionId || run.nativeTerminal)) {
      await preserveRecoveryWindow(run);
      run.phase = "aggregation";
    }
    await saveRun(run);
    await queueRun(key, 15);
    return;
  }
  if (run.phase === "ingesting") await queueWorker(key);
  else await queueRun(key, 1);
}

export async function cleanupSource(
  scope: ReferenceScope,
  budget = new ProcessingBudget(),
): Promise<void> {
  const active = await readReferenceValue<string>(activeRunKey);
  if (active?.startsWith(manifestPrefix(scope))) {
    await queueRun(active);
    await queueSourceDeletion(scope, 30);
    return;
  }
  try {
    while (true) {
      budget.check();
      const page = await nextPage<ReferenceRun>(manifestPrefix(scope));
      if (!page.results.length) break;
      for (const { value } of page.results)
        await pruneReferenceRun(value, budget);
    }
    while (true) {
      budget.check();
      const page = await nextPage(pendingPrefix(scope));
      if (!page.results.length) break;
      await deleteReferenceValues(page.results.map(({ key }) => key));
    }
    await deleteReferenceValues([recoveryKey(scope), cancellationKey(scope)]);
    await setValue<SourceDeletion>(
      deletionKey(scope),
      { ...scope, finished: true },
      {
        keyPolicy: "OVERRIDE",
        ttl: { unit: "DAYS", value: 7 },
      },
      "retain completed deletion marker for late queue deliveries",
    );
  } catch (error) {
    if (error instanceof ContinueLater) {
      await queueSourceDeletion(scope, error.delaySeconds);
      return;
    }
    throw error;
  }
}

export async function referenceHandler(
  event: AsyncEvent<ReferenceEvent | DeleteSourceEvent>,
): Promise<void> {
  if (
    event.concurrency?.key !== importConcurrency.key ||
    event.concurrency.limit !== 1
  )
    throw new Error("Import concurrency control is required");
  if (typeof event.body.runKey === "string")
    await advanceRun(event.body.runKey);
  else if (event.body.scope)
    await cleanupSource(event.body.scope as ReferenceScope);
}

export async function recoverImports(): Promise<void> {
  const budget = new ProcessingBudget(Date.now, 20_000);
  const active = await readReferenceValue<string>(activeRunKey);
  if (active) await queueRun(active);
  for (const testing of [false, true]) {
    for (const prefix of [
      `${referenceRoot(testing)}manifest:`,
      deletionPrefix(testing),
    ]) {
      let cursor: string | undefined;
      do {
        if (budget.deadline - Date.now() < 5_000) return;
        const page = await nextPage<ReferenceRun | SourceDeletion>(
          prefix,
          cursor,
        );
        for (const { key, value } of page.results) {
          if ("finished" in value) {
            if (!value.finished) await queueSourceDeletion(value);
          } else if (value.phase !== "complete" && key !== active)
            await queueRun(key);
        }
        cursor = page.nextCursor;
      } while (cursor !== undefined);
    }
  }
}
