import { describe, expect, it } from "vitest";
import { defaultConfig } from "../../src/lib/config.js";
import {
  type InvocationMetric,
  InvocationMetricSchema,
  type RunSummaryLog,
  RunSummaryLogSchema,
} from "../../src/lib/reference-metric-schemas.js";
import {
  buildSmokePerformanceReport,
  parseSmokeClientReport,
  requireSmokeMetrics,
} from "./import-smoke-report.js";
import type { SmokeClientReport } from "./import-smoke-schemas.js";

const client = {
  durationMs: 1000,
  finishedAt: "2026-10-28T12:01:00Z",
  inputChunks: 5,
  inputRecords: 15,
  requireContinuation: false,
  startedAt: "2026-10-28T12:00:00Z",
  status: "passed" as const,
  steps: [],
  uploadId: "smoke-import-123",
};

function records(id: string) {
  const summary: RunSummaryLog = {
    chunksCheckpointed: 5,
    completedAt: client.finishedAt,
    counts: {
      deleted: 0,
      inactive: 0,
      unchanged: 0,
      unresolved: 14,
      updated: 1,
    },
    detailsPrefix: `user-reference:test:run:${id}:asset:`,
    durationMs: 1000,
    executionId: id,
    importSourceId: "source",
    inputChunks: 5,
    inputRecords: 15,
    lifecycleFailures: 0,
    observedCompletedAt: client.finishedAt,
    observedDurationMs: 1000,
    observedPhaseDurationsMs: { processing: 500 },
    phaseDurationsMs: { processing: 500 },
    queueWaitMs: 10,
    reasons: { unmatched: 14 },
    retentionDurationMs: 20,
    runId: id,
    selected: 15,
    selectionComplete: true,
    startedAt: client.startedAt,
    status: "with_errors",
    testing: true,
    tuning: { ...defaultConfig.tuning },
    unfinished: 0,
    uploadId: client.uploadId,
    workspaceId: "workspace",
  };
  const metric: InvocationMetric = {
    counts: { assetAttempts: 15, http429: 1 },
    durationMs: 100,
    finishedAt: client.finishedAt,
    fromPhase: "processing",
    invocationId: `invocation-${id}`,
    operations: {
      processing: {
        "jira.search": { calls: 15, errors: 0, maxMs: 10, totalMs: 75 },
      },
    },
    outcomes: { unresolved: 14, updated: 1 },
    queue: { delayMs: 0, lagMs: 5, waitMs: 5 },
    reasons: { unmatched: 14 },
    runId: id,
    startedAt: client.startedAt,
    toPhase: "complete",
    tuning: { ...defaultConfig.tuning },
    uploadId: client.uploadId,
    worker: false,
  };
  return [
    `INFO IMPORT_SUMMARY ${JSON.stringify(summary)}`,
    `INFO IMPORT_METRICS ${JSON.stringify(metric)}`,
  ];
}

describe("buildSmokePerformanceReport", () => {
  it("aggregates outcomes across invocation summaries without counting duplicate log retrieval", () => {
    const [summary, invocation] = records("a");
    const prefix = "INFO IMPORT_METRICS ";
    const first = InvocationMetricSchema.parse(
      JSON.parse((invocation ?? "").slice(prefix.length)),
    );
    const second: InvocationMetric = {
      ...first,
      counts: { assetAttempts: 8 },
      invocationId: "second-invocation-a",
      outcomes: { unresolved: 7, updated: 1 },
      reasons: { unmatched: 7 },
    };
    first.counts = { assetAttempts: 7 };
    first.outcomes = { unresolved: 7 };
    first.reasons = { unmatched: 7 };
    const report = buildSmokePerformanceReport(
      client,
      [
        summary,
        prefix + JSON.stringify(first),
        prefix + JSON.stringify(first),
        prefix + JSON.stringify(second),
      ].join("\n"),
      1,
    );
    requireSmokeMetrics(report);
    expect(report.runs[0]).toMatchObject({
      countsObserved: { assetAttempts: 15 },
      deliveriesObserved: 2,
      outcomesObserved: { unresolved: 14, updated: 1 },
      reasonsObserved: { unmatched: 14 },
    });
  });

  it("deduplicates repeated log retrieval, filters other uploads and derives measured rates", () => {
    const lines = [...records("a"), ...records("b")];
    const report = buildSmokePerformanceReport(
      client,
      [
        ...lines,
        ...lines,
        'IMPORT_METRICS {"uploadId":"other","private":"secret"}',
      ].join("\n"),
    );
    requireSmokeMetrics(report);
    expect(report.runs).toHaveLength(2);
    expect(report.runs[0]?.deliveriesObserved).toBe(1);
    expect(report.runs[0]?.processingAssetsPerSecond).toBe(30);
    expect(report.runs[0]?.operations.processing?.["jira.search"]?.meanMs).toBe(
      5,
    );
    expect(report.runs[0]?.countsObserved.http429).toBe(1);
    expect(report.runs[0]?.outcomesObserved).toEqual({
      unresolved: 14,
      updated: 1,
    });
    expect(report.runs[0]?.reasonsObserved).toEqual({ unmatched: 14 });
    expect(JSON.stringify(report)).not.toContain("secret");
  });

  it("reads formatted Forge messages without treating verbose JSON copies as malformed logs", () => {
    const messages = [...records("a"), ...records("b")].map((line) =>
      line.replace(/^INFO /, ""),
    );
    const verbose = messages.map(
      (message) => `        "message": ${JSON.stringify(message)},`,
    );
    const formatted = messages.map(
      (message) =>
        `INFO    2026-10-28T12:01:00.000Z forge-invocation-id ${message}`,
    );
    const report = buildSmokePerformanceReport(
      client,
      [...verbose, ...formatted].join("\n"),
    );

    requireSmokeMetrics(report);
    expect(report.coverage.malformedLines).toBe(0);
    expect(report.coverage.observedRuns).toBe(2);
    expect(report.runs.map((run) => run.deliveriesObserved)).toEqual([1, 1]);
    expect(() =>
      requireSmokeMetrics(
        buildSmokePerformanceReport(client, verbose.join("\n")),
      ),
    ).toThrow("incomplete");
  });

  it("rejects completed logs that still lack required timing or lifecycle context", () => {
    const lines = records("a");
    lines[0] = (lines[0] ?? "").replace('"queueWaitMs":10,', "");
    lines[1] = (lines[1] ?? "").replace('"fromPhase":"processing",', "");
    const report = buildSmokePerformanceReport(client, lines.join("\n"));

    expect(report.coverage.malformedLines).toBe(2);
    expect(() => requireSmokeMetrics(report)).toThrow("incomplete");
  });

  it("rejects fractional operation counts instead of deriving invalid throughput", () => {
    const lines = [...records("a"), ...records("b")];
    lines[1] = (lines[1] ?? "").replace('"calls":15', '"calls":1.5');
    const report = buildSmokePerformanceReport(client, lines.join("\n"));
    expect(report.coverage.malformedLines).toBe(1);
    expect(() => requireSmokeMetrics(report)).toThrow("incomplete");
  });

  it.each([
    "outcomes",
    "reasons",
  ] as const)("rejects invocation metrics missing %s", (field) => {
    const prefix = "INFO IMPORT_METRICS ";
    const lines = [...records("a"), ...records("b")];
    const metric: Partial<InvocationMetric> = InvocationMetricSchema.parse(
      JSON.parse((lines[1] ?? "").slice(prefix.length)),
    );
    delete metric[field];
    lines[1] = prefix + JSON.stringify(metric);
    const report = buildSmokePerformanceReport(client, lines.join("\n"));
    expect(report.coverage.malformedLines).toBe(1);
    expect(() => requireSmokeMetrics(report)).toThrow("incomplete");
  });

  it("rejects missing or malformed metrics rather than calling an incomplete collection successful", () => {
    expect(() =>
      requireSmokeMetrics(
        buildSmokePerformanceReport(client, records("a").join("\n")),
      ),
    ).toThrow("incomplete");
    const report = buildSmokePerformanceReport(
      client,
      [
        ...records("a"),
        ...records("b"),
        "INFO    2026-10-28T12:01:00.000Z forge-invocation-id IMPORT_METRICS {truncated",
      ].join("\n"),
    );
    expect(report.coverage.malformedLines).toBe(1);
    expect(() => requireSmokeMetrics(report)).toThrow("incomplete");
  });

  it("rejects unknown lifecycle statuses instead of treating them as successful summaries", () => {
    const lines = [...records("a"), ...records("b")];
    lines[0] = (lines[0] ?? "").replace(
      '"status":"with_errors"',
      '"status":"unexpected"',
    );
    const report = buildSmokePerformanceReport(client, lines.join("\n"));
    expect(report.coverage.malformedLines).toBe(1);
    expect(report.coverage.observedRuns).toBe(1);
    expect(() => requireSmokeMetrics(report)).toThrow("incomplete");
  });
});

describe("parseSmokeClientReport", () => {
  it("projects metadata without copying unknown fields and validates values", () => {
    expect(parseSmokeClientReport({ ...client, private: "secret" })).toEqual(
      client,
    );
    expect(() => parseSmokeClientReport({ ...client, durationMs: -1 })).toThrow(
      "Invalid smoke client report metadata",
    );
  });

  it.each([
    "inputChunks",
    "inputRecords",
    "requireContinuation",
  ] as const)("rejects reports missing %s", (field) => {
    const report: Partial<SmokeClientReport> = { ...client };
    delete report[field];
    expect(() => parseSmokeClientReport(report)).toThrow(
      "Invalid smoke client report metadata",
    );
  });
});

describe("requireSmokeMetrics", () => {
  it("requires complete outcomes across multiple capped invocations for a larger smoke run", () => {
    const lines = records("boundary");
    const summary = RunSummaryLogSchema.parse(
      JSON.parse((lines[0] ?? "").slice("INFO IMPORT_SUMMARY ".length)),
    );
    const metric = InvocationMetricSchema.parse(
      JSON.parse((lines[1] ?? "").slice("INFO IMPORT_METRICS ".length)),
    );
    summary.counts.unresolved = 249;
    summary.inputChunks = 6;
    summary.inputRecords = 250;
    summary.reasons.unmatched = 249;
    summary.selected = 250;
    summary.tuning = defaultConfig.tuning;
    const initial: InvocationMetric = {
      ...metric,
      counts: { assetAttempts: 200 },
      outcomes: { unresolved: 199, updated: 1 },
      reasons: { unmatched: 199 },
    };
    const continuation: InvocationMetric = {
      ...metric,
      counts: { assetAttempts: 50 },
      invocationId: "continuation",
      outcomes: { unresolved: 50 },
      reasons: { unmatched: 50 },
    };
    const report = buildSmokePerformanceReport(
      {
        ...client,
        inputChunks: 6,
        inputRecords: 250,
        requireContinuation: true,
      },
      [
        `IMPORT_SUMMARY ${JSON.stringify(summary)}`,
        `IMPORT_METRICS ${JSON.stringify(initial)}`,
        `IMPORT_METRICS ${JSON.stringify(continuation)}`,
      ].join("\n"),
      1,
    );
    requireSmokeMetrics(report);
    expect(report.runs[0]).toMatchObject({
      maxAssetAttemptsPerInvocation: 200,
      maxOutcomesPerInvocation: 200,
      processingInvocationsObserved: 2,
    });
    for (const override of [
      { inputRecords: 15 },
      { maxAssetAttemptsPerInvocation: 201 },
      { maxOutcomesPerInvocation: 201 },
      { outcomesObserved: { unresolved: 248, updated: 1 } },
      { processingInvocationsObserved: 1 },
      { reasonsObserved: { unmatched: 248 } },
      { tuning: { ...defaultConfig.tuning, referenceItems: 1000 } },
    ]) {
      expect(() =>
        requireSmokeMetrics({
          ...report,
          runs: report.runs.map((run) => ({ ...run, ...override })),
        }),
      ).toThrow("continuation evidence");
    }
  });
});
