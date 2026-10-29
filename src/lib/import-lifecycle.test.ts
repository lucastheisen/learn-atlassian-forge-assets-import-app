import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fixtureSchema,
  fixtureScope,
  fixtureUpload,
  makeRun,
  storage,
} from "../../tests/helpers/reference-storage";
import {
  ConfigSchema,
  defaultConfig,
  type ImportTuning,
  readConfig,
} from "./config";
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
import { RunSummaryLogSchema } from "./reference-metric-schemas";
import { queueRun, queueSourceDeletion, queueWorker } from "./reference-queues";
import { RunSummarySchema } from "./reference-schemas";
import {
  ProcessingBudget,
  type ReferenceRun,
  type RunSummary,
} from "./reference-types";

const invocation = vi.hoisted(() => ({ remainingTimeMs: 300_000 }));

vi.mock("@forge/api", async (original) => ({
  ...(await original<typeof import("@forge/api")>()),
  getAppContext: () => ({
    invocationRemainingTimeInMillis: () => invocation.remainingTimeMs,
  }),
}));

vi.mock("@forge/kvs", async () => {
  const { storage: memory } = await import(
    "../../tests/helpers/reference-storage.js"
  );
  return {
    WhereConditions: { beginsWith: (prefix: string) => prefix },
    kvs: memory.api,
  };
});

vi.mock("./config", async (original) => ({
  ...(await original<typeof import("./config")>()),
  readConfig: vi.fn(),
}));

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
  progressResult: { result: "OK", status: "FINISHED" },
  status: "DONE" as const,
};

beforeEach(() => {
  invocation.remainingTimeMs = 300_000;
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-28T12:00:00Z"));
  storage.reset();
  vi.mocked(readConfig)
    .mockReset()
    .mockImplementation(() => ConfigSchema.parse(defaultConfig));
  vi.mocked(referenceRequest)
    .mockReset()
    .mockResolvedValue({
      links: {
        submitProgress:
          "https://example.test/executions/new-execution/progress",
      },
      result: "success",
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

async function queueIngestion(
  count: number,
  tuning: Partial<ImportTuning> = {},
) {
  const run = makeRun({
    inputChunks: count,
    inputRecords: count,
    nativeTerminal: false,
    phase: "ingesting",
    tuning: { ...defaultConfig.tuning, ...tuning },
  });
  const key = await queue(run);
  const data = Array.from({ length: count }, (_, index) => ({
    key: `chunk-${index}`,
  }));
  for (const chunk of data) storage.values.set(chunk.key, { users: [{}] });
  storage.values.set(uploadKey(run), {
    ...fixtureUpload,
    data,
    totals: { keys: count, records: count },
  });
  vi.mocked(executionStatus).mockResolvedValue({ status: "INGESTING" });
  return { key, run };
}

describe("advanceRun", () => {
  it("atomically admits one run and durably defers competing starts", async () => {
    const first = makeRun({
      executionId: undefined,
      nativeTerminal: undefined,
      phase: "queued",
    });
    const second = makeRun({
      executionId: undefined,
      id: "second",
      nativeTerminal: undefined,
      phase: "queued",
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

  it("batches upload chunks and completes only the final chunk", async () => {
    const { key, run } = await queueIngestion(5);
    await advanceRun(key, true);
    const posts = vi
      .mocked(referenceRequest)
      .mock.calls.filter(([, , options]) => options?.method === "POST")
      .map(([, , options]) => JSON.parse(String(options?.body)));
    expect(posts.map((body) => body.clientGeneratedId)).toEqual(
      [0, 1, 2, 3, 4].map((index) => `${run.id}:${index}`),
    );
    expect(posts.map((body) => body.completed)).toEqual([
      false,
      false,
      false,
      false,
      true,
    ]);
    expect(await readReferenceValue<ReferenceRun>(key)).toMatchObject({
      index: 5,
      phase: "polling",
    });
    expect(queueWorker).not.toHaveBeenCalled();
    expect(queueRun).toHaveBeenCalledWith(key, 1);
    const metric = vi
      .mocked(console.log)
      .mock.calls.map(([line]) => String(line))
      .find((line) => line.startsWith("IMPORT_METRICS "));
    expect(
      JSON.parse(metric?.slice("IMPORT_METRICS ".length) ?? "null"),
    ).toMatchObject({
      counts: { chunksSubmitted: 5 },
      tuning: run.tuning,
    });
  });

  it("checks cancellation between upload chunks while retaining admission", async () => {
    const { key, run } = await queueIngestion(3);
    vi.mocked(referenceRequest).mockImplementation(
      async (_path, _budget, options) => {
        if (options?.method === "POST")
          storage.values.set(cancellationKey(run), new Date().toISOString());
        return {};
      },
    );
    await advanceRun(key, true);
    expect(await readReferenceValue<ReferenceRun>(key)).toMatchObject({
      failure: "cancelled",
      index: 1,
      phase: "polling",
    });
    expect(storage.values.get(activeRunKey)).toBe(key);
    expect(
      vi
        .mocked(referenceRequest)
        .mock.calls.filter(([, , options]) => options?.method === "POST"),
    ).toHaveLength(1);
  });

  it("does not run reference processing for cancelled or unsuccessful native imports", async () => {
    for (const status of [
      { status: "CANCELLED" as const },
      { status: "DONE" as const },
      {
        progressResult: { result: "ERROR", status: "FINISHED" },
        status: "DONE" as const,
      },
    ]) {
      const run = makeRun({
        id: `run-${status.status}-${String(status.progressResult?.result)}`,
        nativeTerminal: false,
        phase: "polling",
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

  it("holds admission until the completed summary is persisted and recovers a failed summary write", async () => {
    const run = makeRun({
      inputChunks: fixtureUpload.totals.keys,
      inputRecords: fixtureUpload.totals.records,
      phase: "polling",
    });
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
      selected: 0,
      status: "success",
      tuning: defaultConfig.tuning,
      unfinished: 0,
    });
    expect(
      RunSummarySchema.safeParse(storage.values.get(summaryKey(run))).success,
    ).toBe(true);
    const loggedSummary = vi
      .mocked(console.log)
      .mock.calls.map(([line]) => String(line))
      .find((line) => line.startsWith("IMPORT_SUMMARY "));
    expect(loggedSummary).toBeDefined();
    expect(
      RunSummaryLogSchema.safeParse(
        JSON.parse(loggedSummary?.slice("IMPORT_SUMMARY ".length) ?? "null"),
      ).success,
    ).toBe(true);
    expect(
      (storage.values.get(summaryKey(run)) as RunSummary).completedAt,
    ).toBe(checkpoint?.completedAt);
    await advanceRun(key);
    expect(discoverAssets).toHaveBeenCalledTimes(1);
  });

  it.each([
    { finalizationBudgetMs: 270_000, remainingTimeMs: 300_000 },
    { finalizationBudgetMs: 60_000, remainingTimeMs: 90_000 },
  ])("honors the finalization reserve and resumes after its last committed chunk ($finalizationBudgetMs)", async ({
    finalizationBudgetMs,
    remainingTimeMs,
  }) => {
    invocation.remainingTimeMs = remainingTimeMs;
    const { key, run } = await queueIngestion(3, { finalizationBudgetMs });
    vi.mocked(referenceRequest).mockImplementation(
      async (_path, _budget, options) => {
        if (options?.method === "POST") vi.advanceTimersByTime(6_000);
        return {};
      },
    );
    await advanceRun(key, true);
    expect(await readReferenceValue<ReferenceRun>(key)).toMatchObject({
      index: 1,
      phase: "ingesting",
    });
    expect(queueRun).toHaveBeenCalledWith(key, 1);
    for (let delivery = 0; delivery < 2; delivery++) {
      vi.advanceTimersByTime(1_000);
      await advanceRun(key, true);
    }
    const posts = vi
      .mocked(referenceRequest)
      .mock.calls.filter(([, , options]) => options?.method === "POST")
      .map(([, , options]) => JSON.parse(String(options?.body)));
    expect(posts.map((body) => body.clientGeneratedId)).toEqual(
      [0, 1, 2].map((index) => `${run.id}:${index}`),
    );
    expect(await readReferenceValue<ReferenceRun>(key)).toMatchObject({
      index: 3,
      phase: "polling",
    });
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
      selected: 2,
      selectionComplete: false,
      status: "failed",
      unfinished: 2,
    });
  });

  it("recovers an execution created before its ID could be checkpointed", async () => {
    const run = makeRun({
      executionId: undefined,
      nativeTerminal: undefined,
      phase: "starting",
      previousExecutionId: "previous",
      retention: { done: true, keep: [], pending: [], scanned: true },
      startPrepared: true,
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

  it("resumes checkpointed work after an awaited queue push fails", async () => {
    const run = makeRun({
      executionId: undefined,
      nativeTerminal: false,
      phase: "queued",
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

  it("retains admission while native processing is delayed or beyond the polling limit", async () => {
    const run = makeRun({
      nativeTerminal: false,
      phase: "polling",
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
      failure: "native_timeout",
      status: "failed",
    });
    expect(discoverAssets).not.toHaveBeenCalled();
  });

  it("retries an uncommitted upload chunk without replaying committed chunks", async () => {
    const { key, run } = await queueIngestion(3);
    let fail = true;
    vi.mocked(referenceRequest).mockImplementation(
      async (_path, _budget, options) => {
        if (options?.method === "POST") {
          const body = JSON.parse(String(options.body));
          if (body.clientGeneratedId === `${run.id}:1` && fail) {
            fail = false;
            throw new Error("transport unavailable");
          }
        }
        return {};
      },
    );
    await advanceRun(key, true);
    expect(await readReferenceValue<ReferenceRun>(key)).toMatchObject({
      index: 1,
    });
    await advanceRun(key, true);
    const posts = vi
      .mocked(referenceRequest)
      .mock.calls.filter(([, , options]) => options?.method === "POST")
      .map(([, , options]) => JSON.parse(String(options?.body)));
    expect(posts.map((body) => body.clientGeneratedId)).toEqual(
      [0, 1, 1, 2].map((index) => `${run.id}:${index}`),
    );
    expect(await readReferenceValue<ReferenceRun>(key)).toMatchObject({
      index: 3,
      phase: "polling",
    });
  });

  it("serializes cancellation and ignores events from superseded workers", async () => {
    const run = makeRun({ discovery: "sealed", phase: "processing" });
    const key = await queue(run);
    await cancelImports(run.workspaceId, run.importSourceId);
    await advanceRun(key);
    expect(storage.values.get(summaryKey(run))).toMatchObject({
      failure: "cancelled",
      status: "failed",
    });
    storage.values.set(activeRunKey, "newer-run");
    await advanceRun(key, true);
    expect(storage.values.get(activeRunKey)).toBe("newer-run");
    expect(updateReference).not.toHaveBeenCalled();
  });

  it("uses the stored chunk cap across continuations despite configuration changes", async () => {
    const { key } = await queueIngestion(5, { ingestionChunks: 2 });
    vi.mocked(readConfig).mockReturnValue(
      ConfigSchema.parse({ tuning: { ingestionChunks: 1000 } }),
    );
    await advanceRun(key, true);
    expect(await readReferenceValue<ReferenceRun>(key)).toMatchObject({
      index: 2,
      phase: "ingesting",
    });
    expect(queueWorker).toHaveBeenCalledWith(key);
    await advanceRun(key, true);
    expect(await readReferenceValue<ReferenceRun>(key)).toMatchObject({
      index: 4,
      phase: "ingesting",
    });
    await advanceRun(key, true);
    expect(await readReferenceValue<ReferenceRun>(key)).toMatchObject({
      index: 5,
      phase: "polling",
    });
    expect(readConfig).not.toHaveBeenCalled();
  });

  it.each([
    { runTimeoutMs: 2 * 60 * 60_000, status: "failed" },
    { runTimeoutMs: 3 * 60 * 60_000, status: "success" },
  ])("uses the stored lifecycle deadline ($runTimeoutMs)", async ({
    runTimeoutMs,
    status,
  }) => {
    const run = makeRun({
      discovery: "sealed",
      phase: "processing",
      startedAt: "2026-10-28T09:30:00Z",
      tuning: { ...defaultConfig.tuning, runTimeoutMs },
    });
    const key = await queue(run);
    await advanceRun(key);
    expect(storage.values.get(summaryKey(run))).toMatchObject({
      status,
      tuning: run.tuning,
    });
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
  it("captures validated tuning before enqueueing and leaves existing requests unchanged", async () => {
    vi.mocked(readConfig).mockReturnValue(
      ConfigSchema.parse({
        tuning: { ingestionChunks: 100, referenceItems: 1000 },
      }),
    );
    await requestImport({ ...fixtureScope, manifest: fixtureUpload });
    vi.mocked(readConfig).mockReturnValue(
      ConfigSchema.parse({ tuning: { ingestionChunks: 1 } }),
    );
    await requestImport({ ...fixtureScope, manifest: fixtureUpload });
    const runs = [...storage.values.entries()]
      .filter(([key]) => key.startsWith(manifestPrefix(fixtureScope)))
      .map(([, value]) => value as ReferenceRun);
    expect(runs).toHaveLength(2);
    expect(runs).toMatchObject([
      { tuning: { ingestionChunks: 100, referenceItems: 1000 } },
      {
        tuning: {
          ingestionChunks: 1,
          referenceItems: defaultConfig.tuning.referenceItems,
        },
      },
    ]);
  });

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

  it("rejects configuration load failures before persisting a request or starting product work", async () => {
    vi.mocked(readConfig).mockImplementation(() => {
      throw new Error("App configuration is invalid.");
    });
    await expect(
      requestImport({ ...fixtureScope, manifest: fixtureUpload }),
    ).rejects.toThrow("App configuration is invalid.");
    expect(storage.values.size).toBe(0);
    expect(queueRun).not.toHaveBeenCalled();
    expect(referenceRequest).not.toHaveBeenCalled();
  });
});
