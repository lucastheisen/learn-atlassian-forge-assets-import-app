import { appendFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  makeAsset,
  makeRun,
  storage,
} from "../../tests/helpers/reference-storage";
import {
  pendingKey,
  persistSummary,
  readReferenceValue,
  retainThreeRuns,
  runKey,
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
  type ReferenceRun,
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
const budget = () => new ProcessingBudget(() => 0);
beforeEach(() => {
  storage.reset();
  vi.mocked(discoverAssets).mockReset();
  vi.mocked(fetchAsset).mockReset();
  vi.mocked(updateReference).mockReset().mockResolvedValue(undefined);
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());
describe("reference processing at scale", () => {
  it.each([
    7_000, 50_000,
  ])("discovers, processes, summarizes and prunes %i unresolved users over three retained runs", async (count) => {
    vi.mocked(discoverAssets).mockImplementation(async (run) => {
      const nextStart = Math.min(count, run.aqlStart + 100);
      return {
        assetIds: Array.from({ length: nextStart - run.aqlStart }, (_, i) =>
          String(run.aqlStart + i),
        ),
        last: nextStart === count,
        nextStart,
      };
    });
    vi.mocked(fetchAsset).mockImplementation(async (_run, id) =>
      makeAsset(id, { reference: "previous-account" }),
    );
    for (let i = 0; i < 4; i++) {
      let run = makeRun({
        id: `scale-${i}`,
        executionId: `execution-${i}`,
        requestedAt: `2026-10-28T12:0${i}:00Z`,
        startedAt: `2026-10-28T12:0${i}:00Z`,
      });
      await saveRun(run);
      await discoverWork(run, budget());
      expect(run.selected).toBe(count);
      let invocations = 0;
      const itemCap = [20, 100, 1000, 100][i] ?? 100;
      while (run.phase === "processing") {
        await processWork(
          run,
          async () => ({ status: "unresolved", reason: "unmatched" }),
          budget(),
          itemCap,
        );
        invocations++;
        // Simulate a fresh invocation reading only its compact checkpoint.
        run = (await readReferenceValue<ReferenceRun>(runKey(run))) ?? run;
      }
      expect(invocations).toBeGreaterThanOrEqual(Math.ceil(count / itemCap));
      expect(invocations).toBeLessThanOrEqual(Math.ceil(count / itemCap) + 1);
      await aggregateWork(run, budget());
      run.completedAt = `2026-10-28T12:0${i}:30Z`;
      const summary = await persistSummary(run);
      run.phase = "complete";
      await saveRun(run);
      await retainThreeRuns(run, budget());
      expect(summary).toMatchObject({
        counts: { unresolved: count },
        reasons: { unmatched: count },
        selected: count,
        status: "with_errors",
        unfinished: 0,
      });
      expect(Buffer.byteLength(JSON.stringify(summary))).toBeLessThan(2000);
      expect(storage.values.get(summaryKey(run))).toEqual(summary);
      storage.api.batchGet.mockClear();
      storage.api.batchSet.mockClear();
      storage.api.set.mockClear();
      storage.api.get.mockClear();
      vi.mocked(fetchAsset).mockClear();
      vi.mocked(console.warn).mockClear();
    }
    expect(storage.values.has(workKey(makeRun({ id: "scale-0" }), "0"))).toBe(
      false,
    );
    expect(storage.values.has(pendingKey(makeRun(), "0"))).toBe(true);
    expect(
      [...storage.values.keys()].filter((key) => key.includes(":asset:"))
        .length,
    ).toBe(3 * count);
    expect(
      [...storage.values.keys()].filter((key) => key.includes(":pending:"))
        .length,
    ).toBe(count);
    expect(
      storage.metrics.queriedKeys.some(
        (key) => key.includes(":asset:") || key.includes(":inventory:"),
      ),
    ).toBe(false);
    expect(updateReference).not.toHaveBeenCalled();
    const report = {
      candidateCount: count,
      retainedAssetKeys: 4 * count,
      inventoryKeys: [...storage.values.keys()].filter((key) =>
        key.includes(":inventory:"),
      ).length,
      descriptorKeys: [...storage.values.keys()].filter((key) =>
        key.includes(":page-meta:"),
      ).length,
      totalKeys: storage.values.size,
      bytesRead: storage.metrics.bytesRead,
      bytesWritten: storage.metrics.bytesWritten,
      storageRequests: storage.metrics.requests,
    };
    if (process.env.REFERENCE_SCALE_REPORT)
      appendFileSync(
        process.env.REFERENCE_SCALE_REPORT,
        JSON.stringify(report) + "\n",
      );
  }, 120_000);
  it.each(
    [20, 100, 1000].flatMap((cap) =>
      [10, 100, 1000].map((latency) => ({ cap, latency })),
    ),
  )("stops safely at cap $cap with simulated $latency ms request latency", async ({
    cap,
    latency,
  }) => {
    const run = makeRun();
    vi.mocked(discoverAssets).mockResolvedValue({
      assetIds: Array.from({ length: 1000 }, (_, i) => String(i)),
      last: true,
      nextStart: 1000,
    });
    await saveRun(run);
    await discoverWork(run, budget());
    let now = 0;
    let inFlight = 0;
    let peak = 0;
    vi.mocked(fetchAsset).mockImplementation(async (_run, id) => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await Promise.resolve();
      now += latency;
      inFlight--;
      return makeAsset(id);
    });
    const attempt = processWork(
      run,
      async (_fields, runtime) => {
        runtime.check();
        return { status: "unresolved", reason: "unmatched" };
      },
      new ProcessingBudget(() => now, 30_000),
      cap,
      4,
    );
    try {
      await attempt;
    } catch (error) {
      expect(error).toBeInstanceOf(ContinueLater);
    }
    expect(peak).toBeLessThanOrEqual(4);
    expect(inFlight).toBe(0);
    expect(run.phase).toBe("processing");
    expect(run.processingOffset).toBeLessThan(1000);
  });
});
