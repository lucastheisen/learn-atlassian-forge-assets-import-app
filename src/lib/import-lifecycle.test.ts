import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fixtureSchema,
  fixtureScope,
  fixtureUpload,
  makeRun,
  storage,
} from "../../tests/helpers/reference-storage";
import {
  advanceRun,
  cancelImports,
  cleanupSource,
  recoverImports,
  requestImport,
} from "./import-lifecycle";
import {
  activeRunKey,
  cancellationKey,
  deletionKey,
  inventoryKey,
  manifestPrefix,
  pendingKey,
  readReferenceValue,
  runKey,
  saveRun,
  summaryKey,
  uploadKey,
} from "./kv-reference";
import { referenceRequest } from "./reference-api";
import {
  discoverAssets,
  executionStatus,
  latestExecution,
  resolveReferenceSchema,
  updateReference,
} from "./reference-assets";
import { queueRun, queueSourceDeletion, queueWorker } from "./reference-queues";
import {
  ProcessingBudget,
  type ReferenceRun,
  type RunSummary,
} from "./reference-types";

vi.mock("@forge/kvs", async () => {
  const { storage: memory } = await import(
    "../../tests/helpers/reference-storage.js"
  );
  return {
    kvs: memory.api,
    WhereConditions: { beginsWith: (prefix: string) => prefix },
  };
});
vi.mock("./reference-api", () => ({ referenceRequest: vi.fn() }));
vi.mock("./reference-assets", async (original) => ({
  ...(await original<typeof import("./reference-assets")>()),
  discoverAssets: vi.fn(),
  executionStatus: vi.fn(),
  latestExecution: vi.fn(),
  resolveReferenceSchema: vi.fn(),
  updateReference: vi.fn(),
}));
vi.mock("./reference-queues", () => ({
  importConcurrency: { key: "import-lifecycle", limit: 1 },
  queueRun: vi.fn(),
  queueSourceDeletion: vi.fn(),
  queueWorker: vi.fn(),
}));
const nativeOk = {
  status: "DONE" as const,
  progressResult: { result: "OK", status: "FINISHED" },
};
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-28T12:00:00Z"));
  storage.reset();
  vi.mocked(referenceRequest)
    .mockReset()
    .mockResolvedValue({
      result: "success",
      links: {
        submitProgress:
          "https://example.test/executions/new-execution/progress",
      },
    });
  vi.mocked(latestExecution).mockReset().mockResolvedValue(undefined);
  vi.mocked(executionStatus).mockReset().mockResolvedValue(nativeOk);
  vi.mocked(resolveReferenceSchema)
    .mockReset()
    .mockResolvedValue(fixtureSchema);
  vi.mocked(discoverAssets)
    .mockReset()
    .mockResolvedValue({ assetIds: [], last: true, nextStart: 0 });
  vi.mocked(queueRun).mockReset().mockResolvedValue({ jobId: "job" });
  vi.mocked(queueWorker).mockReset().mockResolvedValue({ jobId: "job" });
  vi.mocked(queueSourceDeletion)
    .mockReset()
    .mockResolvedValue({ jobId: "job" });
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
async function queue(run: ReferenceRun) {
  await saveRun(run);
  storage.values.set(uploadKey(run), fixtureUpload);
  return runKey(run);
}

describe("advanceRun", () => {
  it("atomically admits one run and durably defers competing starts", async () => {
    const first = makeRun({
      phase: "queued",
      executionId: undefined,
      nativeTerminal: undefined,
    });
    const second = makeRun({
      id: "second",
      phase: "queued",
      executionId: undefined,
      nativeTerminal: undefined,
    });
    const firstKey = await queue(first);
    const secondKey = await queue(second);
    await Promise.all([advanceRun(firstKey), advanceRun(secondKey)]);
    expect(storage.values.get(activeRunKey)).toBe(firstKey);
    expect(referenceRequest).toHaveBeenCalledTimes(1);
    expect((await readReferenceValue<ReferenceRun>(secondKey))?.phase).toBe(
      "queued",
    );
    expect(queueRun).toHaveBeenCalledWith(secondKey, 30);
    expect(queueWorker).toHaveBeenCalledWith(firstKey);
  });
  it("recovers an execution created before its ID could be checkpointed", async () => {
    const run = makeRun({
      phase: "starting",
      executionId: undefined,
      startPrepared: true,
      previousExecutionId: "previous",
      nativeTerminal: undefined,
      retention: { done: true, keep: [], pending: [], scanned: true },
    });
    const key = await queue(run);
    vi.mocked(latestExecution).mockResolvedValue({
      executionId: "recovered",
      status: "INGESTING",
    });
    await advanceRun(key);
    expect(referenceRequest).not.toHaveBeenCalled();
    expect((await readReferenceValue<ReferenceRun>(key))?.executionId).toBe(
      "recovered",
    );
    expect(storage.values.get(activeRunKey)).toBe(key);
  });
  it("does not run reference processing for cancelled or unsuccessful native imports", async () => {
    for (const status of [
      { status: "CANCELLED" as const },
      { status: "DONE" as const },
      {
        status: "DONE" as const,
        progressResult: { result: "ERROR", status: "FINISHED" },
      },
    ]) {
      const run = makeRun({
        id: `run-${status.status}-${String(status.progressResult?.result)}`,
        phase: "polling",
        nativeTerminal: false,
      });
      const key = await queue(run);
      vi.mocked(executionStatus).mockResolvedValue(status);
      await advanceRun(key);
      const result = storage.values.get(summaryKey(run)) as RunSummary;
      expect(result.status).toBe("failed");
    }
    expect(discoverAssets).not.toHaveBeenCalled();
    expect(updateReference).not.toHaveBeenCalled();
  });
  it("holds admission until the completed summary is persisted and recovers a failed summary write", async () => {
    const run = makeRun({ phase: "polling" });
    const key = await queue(run);
    const write = storage.api.set.getMockImplementation();
    let failures = 1;
    storage.api.set.mockImplementation(async (target, value, options) => {
      if (target === summaryKey(run) && failures-- > 0)
        throw new Error("storage unavailable");
      return write?.(target, value, options);
    });
    await advanceRun(key);
    expect(storage.values.get(activeRunKey)).toBe(key);
    expect(storage.values.has(summaryKey(run))).toBe(false);
    const checkpoint = await readReferenceValue<ReferenceRun>(key);
    expect(checkpoint?.phase).toBe("finalizing");
    await advanceRun(key);
    expect(storage.values.has(activeRunKey)).toBe(false);
    expect(storage.values.get(summaryKey(run))).toMatchObject({
      status: "success",
      selected: 0,
      unfinished: 0,
    });
    expect(
      (storage.values.get(summaryKey(run)) as RunSummary).completedAt,
    ).toBe(checkpoint?.completedAt);
    await advanceRun(key);
    expect(discoverAssets).toHaveBeenCalledTimes(1);
  });
  it("retains admission while native processing is delayed or beyond the polling limit", async () => {
    const run = makeRun({
      phase: "polling",
      nativeTerminal: false,
      startedAt: "2026-10-28T11:00:00Z",
    });
    const key = await queue(run);
    vi.mocked(executionStatus).mockResolvedValue({ status: "PROCESSING" });
    await advanceRun(key);
    expect(storage.values.get(activeRunKey)).toBe(key);
    expect(storage.values.has(summaryKey(run))).toBe(false);
    vi.mocked(executionStatus).mockResolvedValue(nativeOk);
    vi.advanceTimersByTime(60_000);
    await advanceRun(key);
    expect(storage.values.get(summaryKey(run))).toMatchObject({
      status: "failed",
      failure: "native_timeout",
    });
    expect(discoverAssets).not.toHaveBeenCalled();
  });
  it("serializes cancellation and ignores events from superseded workers", async () => {
    const run = makeRun({ phase: "processing", discovery: "sealed" });
    const key = await queue(run);
    await cancelImports(run.workspaceId, run.importSourceId);
    await advanceRun(key);
    expect(storage.values.get(summaryKey(run))).toMatchObject({
      status: "failed",
      failure: "cancelled",
    });
    storage.values.set(activeRunKey, "newer-run");
    await advanceRun(key, true);
    expect(storage.values.get(activeRunKey)).toBe("newer-run");
    expect(updateReference).not.toHaveBeenCalled();
  });
  it("preserves staged discovery and reports unfinished known candidates when cancelled", async () => {
    const run = makeRun();
    const key = await queue(run);
    storage.values.set(inventoryKey(run, 0), {
      assetIds: ["a", "b"],
      nextAqlStart: 2,
      nextDiscovery: "aql",
      sealed: false,
    });
    storage.values.set(cancellationKey(run), "2026-10-28T12:00:00Z");
    await advanceRun(key);
    expect(storage.values.get(summaryKey(run))).toMatchObject({
      status: "failed",
      selected: 2,
      unfinished: 2,
      selectionComplete: false,
    });
  });
  it("resumes checkpointed work after an awaited queue push fails", async () => {
    const run = makeRun({
      phase: "queued",
      executionId: undefined,
      nativeTerminal: false,
    });
    const key = await queue(run);
    vi.mocked(queueWorker).mockRejectedValueOnce(
      new Error("queue unavailable"),
    );
    await expect(advanceRun(key)).rejects.toThrow("queue unavailable");
    expect((await readReferenceValue<ReferenceRun>(key))?.phase).toBe(
      "ingesting",
    );
    await recoverImports();
    expect(queueRun).toHaveBeenCalledWith(key);
  });
  it("does not submit more work when the invocation budget is exhausted", async () => {
    const run = makeRun({ phase: "discovery" });
    const key = await queue(run);
    await advanceRun(
      key,
      false,
      undefined,
      new ProcessingBudget(Date.now, 1000),
    );
    expect(discoverAssets).not.toHaveBeenCalled();
    expect((await readReferenceValue<ReferenceRun>(key))?.phase).toBe(
      "discovery",
    );
    expect(storage.values.get(activeRunKey)).toBe(key);
  });
});

describe("cleanupSource", () => {
  it("defers cleanup while the source is active, then deletes pending entries independently of report retention", async () => {
    const run = makeRun({ phase: "complete" });
    const key = await queue(run);
    storage.values.set(pendingKey(run, "a"), {
      assetId: "a",
      runId: "old-run",
    });
    storage.values.set(activeRunKey, key);
    await cleanupSource(fixtureScope);
    expect(storage.values.has(pendingKey(run, "a"))).toBe(true);
    storage.values.delete(activeRunKey);
    await cleanupSource(fixtureScope);
    expect(storage.values.has(pendingKey(run, "a"))).toBe(false);
    expect(storage.values.has(key)).toBe(false);
    expect(storage.values.get(deletionKey(fixtureScope))).toMatchObject({
      finished: true,
    });
  });
});

describe("requestImport", () => {
  it("persists requests before enqueueing without starting product API work in the entrypoint", async () => {
    await Promise.all([
      requestImport({ ...fixtureScope, manifest: fixtureUpload }),
      requestImport({ ...fixtureScope, manifest: fixtureUpload }),
    ]);
    expect(
      [...storage.values.keys()].filter((key) =>
        key.startsWith(manifestPrefix(fixtureScope)),
      ),
    ).toHaveLength(2);
    expect(queueRun).toHaveBeenCalledTimes(2);
    expect(referenceRequest).not.toHaveBeenCalled();
  });
});
