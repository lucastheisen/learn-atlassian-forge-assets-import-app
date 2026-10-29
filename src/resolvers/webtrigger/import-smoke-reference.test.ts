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
    WhereConditions: { beginsWith: (prefix: string) => prefix },
    kvs: memory.api,
  };
});

vi.mock("../../lib/reference-api", () => ({ referenceRequest: vi.fn() }));

beforeEach(() => {
  storage.reset();
  vi.mocked(referenceRequest).mockReset();
});

afterEach(() => vi.restoreAllMocks());

describe("assertSmokeReferences", () => {
  it("accepts only unmatched outcomes and rejects incomplete selection or repeat writes", async () => {
    const run = makeRun({ phase: "complete" });
    storage.values.set(runKey(run), run);
    const summary = {
      counts: { unresolved: 14, updated: 0 },
      reasons: { unmatched: 14 },
      selectionComplete: true,
      status: "with_errors",
      unfinished: 0,
    };
    storage.values.set(summaryKey(run), summary);
    await assertSmokeReferences(fixtureScope, "execution", {
      expectedUnmatched: 14,
      uploadId: "upload",
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});
    for (const bad of [
      { ...summary, selectionComplete: false },
      { ...summary, counts: { unresolved: 14, updated: 1 } },
    ]) {
      storage.values.set(summaryKey(run), bad);
      await expect(
        assertSmokeReferences(fixtureScope, "execution", {
          expectedUnmatched: 14,
          uploadId: "upload",
        }),
      ).rejects.toThrow("expected terminal result");
    }
  });

it("independently confirms the referenced account email and detects an unexpected timestamp change", async () => {
    const run = makeRun({ phase: "complete" });
    storage.values.set(runKey(run), run);
    storage.values.set(summaryKey(run), {
      counts: { unresolved: 14, updated: 1 },
      reasons: { unmatched: 14 },
      selectionComplete: true,
      status: "with_errors",
      unfinished: 0,
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
      expectedUnmatched: 14,
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
    storage.values.set(summaryKey(run), {
      counts: { unresolved: 14, updated: 0 },
      reasons: { unmatched: 14 },
      selectionComplete: true,
      status: "with_errors",
      unfinished: 0,
    });
    await expect(
      assertSmokeReferences(fixtureScope, "execution", {
        baseline: "verify",
        email: "known@example.test",
        expectedUnmatched: 14,
        uploadId: "upload",
      }),
    ).rejects.toThrow("Updated timestamp");
  });

it.each([
    "lookup_failed",
    "update_failed",
    "email_unavailable",
  ])("rejects unresolved %s errors even when their count is 14", async (reason) => {
    const run = makeRun({ phase: "complete" });
    storage.values.set(runKey(run), run);
    storage.values.set(summaryKey(run), {
      counts: { unresolved: 14, updated: 0 },
      reasons: { [reason]: 14 },
      selectionComplete: true,
      status: "with_errors",
      unfinished: 0,
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});
    await expect(
      assertSmokeReferences(fixtureScope, "execution", {
        expectedUnmatched: 14,
        uploadId: "upload",
      }),
    ).rejects.toThrow("expected terminal result");
    expect(referenceRequest).not.toHaveBeenCalled();
  });

it("waits for the newest request rather than accepting a preceding completed execution", async () => {
    const previous = makeRun({
      id: "a",
      phase: "complete",
      uploadId: "upload",
    });
    const current = makeRun({
      executionId: undefined,
      id: "b",
      phase: "queued",
      uploadId: "upload",
    });
    storage.values.set(runKey(previous), previous);
    storage.values.set(runKey(current), current);
    await expect(
      assertSmokeReferences(fixtureScope, "execution", {
        expectedUnmatched: 0,
        uploadId: "upload",
      }),
    ).rejects.toThrow("has not completed");
  });
});
