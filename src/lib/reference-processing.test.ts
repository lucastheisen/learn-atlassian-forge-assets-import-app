import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  makeAsset,
  makeRun,
  storage,
} from "../../tests/helpers/reference-storage";
import {
  commitInventoryPage,
  inventoryKey,
  pendingKey,
  pendingPrefix,
  persistSummary,
  pruneReferenceRun,
  readWorkItems,
  retainThreeRuns,
  runKey,
  saveReferenceValue,
  saveRun,
  summaryKey,
  workKey,
} from "./kv-reference";
import {
  discoverAssets,
  fetchAsset,
  updateReference,
} from "./reference-assets";
import {
  aggregateWork,
  discoverWork,
  processWork,
} from "./reference-processing";
import {
  ContinueLater,
  ProcessingBudget,
  ProductRequestError,
  type ReferenceRun,
  type WorkItem,
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
vi.mock("./reference-assets", async (original) => ({
  ...(await original<typeof import("./reference-assets")>()),
  discoverAssets: vi.fn(),
  fetchAsset: vi.fn(),
  updateReference: vi.fn(),
}));

const budget = () => new ProcessingBudget();
const matched = vi.fn(async () => ({
  status: "matched" as const,
  accountId: "account",
}));
async function seed(run: ReferenceRun, ids: string[]) {
  await saveRun(run);
  await commitInventoryPage(
    run,
    {
      assetIds: ids,
      nextAqlStart: ids.length,
      nextDiscovery: "sealed",
      sealed: false,
    },
    budget(),
  );
  run.phase = "processing";
  await saveRun(run);
}
const work = (run: ReferenceRun, id: string) =>
  storage.values.get(workKey(run, id)) as WorkItem | undefined;
beforeEach(() => {
  storage.reset();
  vi.mocked(discoverAssets).mockReset();
  vi.mocked(fetchAsset)
    .mockReset()
    .mockImplementation(async (_run, id) => makeAsset(id));
  vi.mocked(updateReference).mockReset().mockResolvedValue(undefined);
  matched.mockClear();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("aggregateWork", () => {
  it("does not report success for missing results and resumes without counting twice", async () => {
    const run = makeRun();
    await seed(run, ["a", "b"]);
    storage.values.set(workKey(run, "a"), {
      ...work(run, "a"),
      outcome: "updated",
    });
    await expect(aggregateWork(run, budget())).rejects.toThrow("incomplete");
    expect(run.aggregation.total).toBe(0);
    run.failure = "processing_failed";
    await aggregateWork(run, budget());
    run.completedAt = "2026-10-28T12:01:00Z";
    const summary = await persistSummary(run);
    expect(summary).toMatchObject({
      status: "failed",
      unfinished: 1,
      counts: { updated: 1 },
    });
    expect(storage.values.get(summaryKey(run))).toEqual(summary);
  });
});

describe("commitInventoryPage", () => {
  it("recovers partial batch writes using the staged inventory without orphaning keys or duplicating candidates", async () => {
    const run = makeRun();
    await saveRun(run);
    const page = {
      assetIds: ["a", "b"],
      nextAqlStart: 2,
      nextDiscovery: "retries" as const,
      sealed: false,
    };
    const original = storage.api.batchSet.getMockImplementation();
    storage.api.batchSet.mockImplementationOnce(async (items) => {
      const first = items[0];
      if (first) storage.values.set(first.key, first.value);
      return {
        successfulKeys: first ? [{ key: first.key }] : [],
        failedKeys: [
          {
            key: items[1]?.key ?? "",
            error: { code: "THROTTLED", message: "Retry" },
          },
        ],
      };
    });
    await expect(
      commitInventoryPage(run, page, budget()),
    ).rejects.toMatchObject({ code: "KVS_SET_FAILED" });
    expect(run.inventoryPages).toBe(0);
    expect(storage.values.has(inventoryKey(run, 0))).toBe(true);
    if (!original) throw new Error("Missing storage fixture implementation");
    storage.api.batchSet.mockImplementation(original);
    await commitInventoryPage(run, page, budget());
    expect(run).toMatchObject({ inventoryPages: 1, selected: 2 });
    await commitInventoryPage(
      run,
      { ...page, assetIds: ["b", "c"], nextDiscovery: "sealed" },
      budget(),
    );
    expect(run.selected).toBe(3);
    expect(storage.values.get(inventoryKey(run, 1))).toMatchObject({
      assetIds: ["c"],
    });
  });
});

describe("discoverWork", () => {
  it("seals the union of AQL candidates and pending retries before reference writes", async () => {
    const run = makeRun();
    await saveRun(run);
    await saveReferenceValue(pendingKey(run, "b"), {
      assetId: "b",
      runId: "previous",
    });
    await saveReferenceValue(pendingKey(run, "c"), {
      assetId: "c",
      runId: "previous",
    });
    vi.mocked(discoverAssets).mockResolvedValue({
      assetIds: ["a", "b"],
      last: true,
      nextStart: 2,
    });
    await discoverWork(run, budget());
    expect(run).toMatchObject({
      discovery: "sealed",
      phase: "processing",
      selected: 3,
    });
    expect(updateReference).not.toHaveBeenCalled();
    expect((await readWorkItems(run, ["a", "b", "c"])).size).toBe(3);
    expect(
      storage.metrics.queriedKeys.every((key) =>
        key.startsWith(pendingPrefix(run)),
      ),
    ).toBe(true);
  });
  it("retains the fixed timestamp and AQL position across budget exits", async () => {
    const run = makeRun();
    await saveRun(run);
    let time = 0;
    vi.mocked(discoverAssets).mockImplementation(async () => {
      time = 80_000;
      return { assetIds: ["a"], last: false, nextStart: 1 };
    });
    await expect(
      discoverWork(run, new ProcessingBudget(() => time, 100_000)),
    ).rejects.toBeInstanceOf(ContinueLater);
    expect(storage.values.has(inventoryKey(run, 0))).toBe(true);
    vi.mocked(discoverAssets).mockResolvedValue({
      assetIds: ["b"],
      last: true,
      nextStart: 2,
    });
    await discoverWork(run, budget());
    expect(run.selected).toBe(2);
    expect(run.selectionStartedAt).toBe("2026-10-28T12:00:00.000Z");
  });
});

describe("processWork", () => {
  it("replaces stale references with one account, skips matches, and never touches unrelated attributes", async () => {
    const run = makeRun();
    await seed(run, ["changed", "same"]);
    vi.mocked(fetchAsset).mockImplementation(async (_run, id) =>
      makeAsset(id, { reference: id === "same" ? "account" : "old" }),
    );
    await processWork(run, matched, budget());
    expect(updateReference).toHaveBeenCalledExactlyOnceWith(
      run,
      "changed",
      "account",
      expect.any(ProcessingBudget),
    );
    expect(work(run, "changed")?.outcome).toBe("updated");
    expect(work(run, "same")?.outcome).toBe("unchanged");
    await processWork(run, matched, budget());
    expect(matched).toHaveBeenCalledTimes(2);
    expect(storage.values.has(pendingKey(run, "changed"))).toBe(false);
  });
  it("leaves unmatched and unknown-activity assets untouched but reports errors and retains retries", async () => {
    const run = makeRun();
    await seed(run, ["missing", "unknown"]);
    vi.mocked(fetchAsset).mockImplementation(async (_run, id) =>
      makeAsset(id, {
        active: id === "unknown" ? "?" : true,
        reference: "old",
      }),
    );
    await processWork(
      run,
      async () => ({ status: "unresolved", reason: "unmatched" }),
      budget(),
    );
    await aggregateWork(run, budget());
    expect(updateReference).not.toHaveBeenCalled();
    expect(run.aggregation).toMatchObject({
      total: 2,
      counts: { unresolved: 2 },
      reasons: { unknown_activity: 1, unmatched: 1 },
    });
    expect(storage.values.has(pendingKey(run, "missing"))).toBe(true);
    const logs = JSON.stringify(vi.mocked(console.warn).mock.calls);
    expect(logs).toContain("ASSET-missing");
    expect(logs).not.toContain("someone@example.test");
  });
  it("removes pending retries only for authoritative inactivity or confirmed deletion", async () => {
    const run = makeRun();
    await seed(run, ["inactive", "deleted", "forbidden"]);
    vi.mocked(fetchAsset).mockImplementation(async (_run, id) => {
      if (id === "deleted") throw new ProductRequestError(404);
      if (id === "forbidden") throw new ProductRequestError(403);
      return makeAsset(id, { active: false, reference: "old" });
    });
    await processWork(run, matched, budget());
    expect(work(run, "inactive")?.outcome).toBe("inactive");
    expect(work(run, "deleted")?.outcome).toBe("deleted");
    expect(work(run, "forbidden")?.reason).toBe("asset_fetch_failed");
    expect(storage.values.has(pendingKey(run, "forbidden"))).toBe(true);
    expect(updateReference).not.toHaveBeenCalled();
    expect(matched).not.toHaveBeenCalled();
  });
  it("persists recovery state before lookup and retries cleanup without repeating a successful write", async () => {
    const run = makeRun();
    await seed(run, ["a"]);
    const lookup = vi.fn(async () => {
      expect(storage.values.has(pendingKey(run, "a"))).toBe(true);
      return { status: "matched" as const, accountId: "account" };
    });
    storage.api.batchDelete.mockResolvedValueOnce({
      successfulKeys: [],
      failedKeys: [
        {
          key: pendingKey(run, "a"),
          error: { code: "THROTTLED", message: "retry" },
        },
      ],
    });
    await expect(processWork(run, lookup, budget())).rejects.toMatchObject({
      code: "KVS_DELETE_FAILED",
    });
    expect(work(run, "a")).toMatchObject({
      outcome: "updated",
      pendingCleanup: true,
    });
    await processWork(run, lookup, budget());
    expect(work(run, "a")?.pendingCleanup).toBe(false);
    expect(updateReference).toHaveBeenCalledTimes(1);
    expect(lookup).toHaveBeenCalledTimes(1);
  });
  it("bounds rate-limited attempts and retains failed replacements for the next full import", async () => {
    const run = makeRun();
    await seed(run, ["a"]);
    vi.mocked(fetchAsset).mockResolvedValue(
      makeAsset("a", { reference: "old" }),
    );
    vi.mocked(updateReference).mockRejectedValue(new ContinueLater(60));
    await expect(processWork(run, matched, budget())).rejects.toMatchObject({
      delaySeconds: 60,
    });
    await expect(processWork(run, matched, budget())).rejects.toMatchObject({
      delaySeconds: 60,
    });
    await processWork(run, matched, budget());
    expect(work(run, "a")).toMatchObject({
      attempts: 3,
      outcome: "unresolved",
      reason: "update_failed",
    });
    const next = makeRun({ id: "next", executionId: "next-execution" });
    vi.mocked(discoverAssets).mockResolvedValue({
      assetIds: [],
      last: true,
      nextStart: 0,
    });
    await discoverWork(next, budget());
    expect(next.selected).toBe(1);
  });
  it("waits for other in-flight items when one fails to persist", async () => {
    const run = makeRun();
    await seed(run, ["a", "b"]);
    let release: (() => void) | undefined;
    let completed = false;
    vi.mocked(updateReference).mockImplementation(async (_run, id) => {
      if (id === "b")
        await new Promise<void>((resolve) => {
          release = resolve;
        });
    });
    const original = storage.api.set.getMockImplementation();
    storage.api.set.mockImplementation(async (key, value, options) => {
      if (key === workKey(run, "a") && (value as WorkItem).outcome)
        throw new Error("storage failed");
      return original?.(key, value, options);
    });
    const processing = processWork(run, matched, budget()).then(
      () => {
        completed = true;
      },
      () => {
        completed = true;
      },
    );
    await vi.waitFor(() => expect(release).toBeDefined());
    expect(completed).toBe(false);
    release?.();
    await processing;
    expect(work(run, "b")?.outcome).toBe("updated");
    expect(run.processingOffset).toBe(0);
  });
});

describe("retention", () => {
  it("keeps three runs and derives deletion keys without reading outcomes or deleting pending retries", async () => {
    for (let i = 1; i <= 4; i++) {
      const run = makeRun({
        id: `run-${i}`,
        requestedAt: `2026-10-28T12:0${i}:00Z`,
        startedAt: `2026-10-28T12:0${i}:00Z`,
      });
      await seed(run, ["a", "b"]);
      run.phase = "complete";
      await saveRun(run);
    }
    const current = storage.values.get(
      runKey(makeRun({ id: "run-4" })),
    ) as ReferenceRun;
    await saveReferenceValue(pendingKey(current, "a"), {
      assetId: "a",
      runId: "run-1",
    });
    storage.metrics.queriedKeys = [];
    storage.api.batchGet.mockClear();
    await retainThreeRuns(current, budget());
    expect(storage.values.has(runKey(makeRun({ id: "run-1" })))).toBe(false);
    expect(storage.values.has(pendingKey(current, "a"))).toBe(true);
    expect(storage.api.batchGet).not.toHaveBeenCalled();
    expect(
      storage.metrics.queriedKeys.every((key) => key.includes(":manifest:")),
    ).toBe(true);
  });
  it("resumes partial deletion without losing its inventory", async () => {
    const run = makeRun();
    await seed(run, ["a", "b"]);
    storage.api.batchDelete.mockResolvedValueOnce({
      successfulKeys: [{ key: workKey(run, "a") }],
      failedKeys: [
        {
          key: workKey(run, "b"),
          error: { code: "THROTTLED", message: "retry" },
        },
      ],
    });
    await expect(pruneReferenceRun(run, budget())).rejects.toMatchObject({
      code: "KVS_DELETE_FAILED",
    });
    expect(storage.values.has(inventoryKey(run, 0))).toBe(true);
    await pruneReferenceRun(run, budget());
    expect(storage.values.has(runKey(run))).toBe(false);
    expect(
      [...storage.values.keys()].some((key) => key.includes(":asset:")),
    ).toBe(false);
  });
});
