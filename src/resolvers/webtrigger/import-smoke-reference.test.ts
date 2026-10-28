import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fixtureScope,
  makeAsset,
  makeRun,
  storage,
} from "../../../tests/helpers/reference-storage";
import { runKey, summaryKey } from "../../lib/kv-reference";
import { referenceRequest } from "../../lib/reference-api";
import {
  assertSmokeReferences,
  smokeBaselineKey,
} from "./import-smoke-reference";

vi.mock("@forge/kvs", async () => {
  const { storage: memory } = await import(
    "../../../tests/helpers/reference-storage.js"
  );
  return {
    kvs: memory.api,
    WhereConditions: { beginsWith: (prefix: string) => prefix },
  };
});
vi.mock("../../lib/reference-api", () => ({ referenceRequest: vi.fn() }));
beforeEach(() => {
  storage.reset();
  vi.mocked(referenceRequest).mockReset();
});
afterEach(() => vi.restoreAllMocks());
describe("assertSmokeReferences", () => {
  it("waits for the newest request rather than accepting a preceding completed execution", async () => {
    const previous = makeRun({
      phase: "complete",
      id: "a",
      uploadId: "upload",
    });
    const current = makeRun({
      phase: "queued",
      id: "b",
      uploadId: "upload",
      executionId: undefined,
    });
    storage.values.set(runKey(previous), previous);
    storage.values.set(runKey(current), current);
    await expect(
      assertSmokeReferences(fixtureScope, "execution", {
        expectedUnresolved: 0,
        uploadId: "upload",
      }),
    ).rejects.toThrow("has not completed");
  });
  it("independently confirms the referenced account email and detects an unexpected timestamp change", async () => {
    const run = makeRun({ phase: "complete" });
    storage.values.set(runKey(run), run);
    storage.values.set(summaryKey(run), {
      status: "with_errors",
      unfinished: 0,
      counts: { unresolved: 14 },
    });
    const asset = {
      ...makeAsset("a", { reference: "account" }),
      updated: "2026-10-28T12:00:00Z",
    };
    vi.mocked(referenceRequest)
      .mockResolvedValueOnce({ values: [asset] })
      .mockResolvedValueOnce({
        accountId: "account",
        email: "known@example.test",
      });
    await assertSmokeReferences(fixtureScope, "execution", {
      baseline: "remember",
      email: "known@example.test",
      expectedUnresolved: 14,
      uploadId: "upload",
    });
    expect(
      storage.values.get(smokeBaselineKey(fixtureScope, "upload")),
    ).toEqual({ assetId: "a", updated: asset.updated });
    vi.mocked(referenceRequest)
      .mockResolvedValueOnce({
        values: [{ ...asset, updated: "2026-10-28T12:01:00Z" }],
      })
      .mockResolvedValueOnce({
        accountId: "account",
        email: "known@example.test",
      });
    await expect(
      assertSmokeReferences(fixtureScope, "execution", {
        baseline: "verify",
        email: "known@example.test",
        expectedUnresolved: 14,
        uploadId: "upload",
      }),
    ).rejects.toThrow("Updated timestamp");
  });
});
