import { afterEach, describe, expect, it, vi } from "vitest";
import { makeRun } from "../../tests/helpers/reference-storage";
import { InvocationMetricSchema } from "./reference-metric-schemas";
import {
  countReferenceMetric,
  countReferenceOutcome,
  measureReferenceOperation,
  observeReferenceRun,
  withReferenceMetrics,
} from "./reference-metrics";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("withReferenceMetrics", () => {
  it("emits empty outcome and reason maps when an invocation performs no asset work", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    await withReferenceMetrics(false, async () => {
      observeReferenceRun(makeRun({ phase: "discovery" }));
    });
    expect(log).toHaveBeenCalledTimes(1);
    const report = InvocationMetricSchema.parse(
      JSON.parse(
        String(log.mock.calls[0]?.[0]).slice("IMPORT_METRICS ".length),
      ),
    );
    expect(report.outcomes).toEqual({});
    expect(report.reasons).toEqual({});
  });

  it("isolates concurrent invocations and captures operations that throw without exposing payloads", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    await Promise.all(
      ["a", "b"].map((id) =>
        withReferenceMetrics(false, async () => {
          observeReferenceRun(makeRun({ id, phase: "processing" }));
          countReferenceMetric("assetAttempts");
          countReferenceOutcome("unresolved", "unmatched");
          await measureReferenceOperation("jira.search", async () => {});
          await expect(
            measureReferenceOperation("jira.email", async () => {
              throw new Error("private@example.test Authorization: secret");
            }),
          ).rejects.toThrow();
        }),
      ),
    );
    const reports = log.mock.calls.map(([line]) =>
      InvocationMetricSchema.parse(
        JSON.parse(String(line).slice("IMPORT_METRICS ".length)),
      ),
    );
    expect(reports.map((value) => value.runId).sort()).toEqual(["a", "b"]);
    for (const value of reports) {
      expect(value.counts.assetAttempts).toBe(1);
      expect(value.outcomes).toEqual({ unresolved: 1 });
      expect(value.reasons).toEqual({ unmatched: 1 });
      expect(value.operations.processing?.["jira.search"]?.calls).toBe(1);
      expect(value.operations.processing?.["jira.email"]?.errors).toBe(1);
    }
    expect(JSON.stringify(reports)).not.toContain("private@example.test");
    expect(JSON.stringify(reports)).not.toContain("secret");
  });

  it("separates intentional queue delay from excess delivery lag", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    await withReferenceMetrics(
      true,
      async () => {
        observeReferenceRun(makeRun());
      },
      { delayMs: 200, queuedAt: 500 },
    );
    const report = InvocationMetricSchema.parse(
      JSON.parse(
        String(log.mock.calls[0]?.[0]).slice("IMPORT_METRICS ".length),
      ),
    );
    expect(report.queue).toEqual({ delayMs: 200, lagMs: 300, waitMs: 500 });
  });
});
