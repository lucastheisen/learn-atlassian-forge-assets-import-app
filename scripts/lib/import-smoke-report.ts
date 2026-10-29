import {
  type InvocationMetric,
  InvocationMetricSchema,
  MetricCounterSchema,
  MetricOperationSchema,
  type OperationMetric,
  type RunSummaryLog,
  RunSummaryLogSchema,
} from "../../src/lib/reference-metric-schemas.js";
import {
  AssociationReasonSchema,
  OutcomeSchema,
  RunPhaseSchema,
} from "../../src/lib/reference-schemas.js";
import {
  type SmokeClientReport,
  SmokeClientReportSchema,
  SmokeLogEnvelopeSchema,
} from "./import-smoke-schemas.js";

export function buildSmokePerformanceReport(
  client: SmokeClientReport,
  logs: string,
  expectedRuns = 2,
) {
  const invocations = new Map<string, InvocationMetric>();
  const summaries = new Map<string, RunSummaryLog>();
  let malformedLines = 0;

  for (const line of logs.split("\n")) {
    const message = line
      .trimStart()
      .match(/^(?:INFO\s+.*?)?(IMPORT_METRICS|IMPORT_SUMMARY) (.*)$/);
    if (!message) continue;
    const [, marker, payload] = message;

    try {
      const value: unknown = JSON.parse(payload ?? "");
      const envelope = SmokeLogEnvelopeSchema.safeParse(value);
      if (!envelope.success) {
        malformedLines++;
        continue;
      }
      if (envelope.data.uploadId !== client.uploadId) continue;
      if (marker === "IMPORT_SUMMARY") {
        const result = RunSummaryLogSchema.safeParse(value);
        if (!result.success) {
          malformedLines++;
          continue;
        }
        summaries.set(result.data.runId, result.data);
      } else {
        const result = InvocationMetricSchema.safeParse(value);
        if (!result.success) {
          malformedLines++;
          continue;
        }
        invocations.set(result.data.invocationId, result.data);
      }
    } catch {
      malformedLines++;
    }
  }

  const runs = [...summaries.values()]
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
    .map((summary) => {
      let activeInvocationMs = 0;
      let deliveries = 0;
      let maxAssetAttemptsPerInvocation = 0;
      let maxInvocationLogBytes = 0;
      let maxOutcomesPerInvocation = 0;
      let maxQueueLagMs = 0;
      let processingInvocationsObserved = 0;
      const counts: Record<string, number> = {};
      const operations: Record<
        string,
        Record<string, OperationMetric & { meanMs: number }>
      > = {};
      const outcomesObserved: InvocationMetric["outcomes"] = {};
      const reasonsObserved: InvocationMetric["reasons"] = {};

      for (const entry of invocations.values()) {
        if (entry.runId !== summary.runId) continue;
        deliveries++;
        activeInvocationMs += entry.durationMs;
        const attempts = entry.counts.assetAttempts ?? 0;
        maxAssetAttemptsPerInvocation = Math.max(
          maxAssetAttemptsPerInvocation,
          attempts,
        );
        maxInvocationLogBytes = Math.max(
          maxInvocationLogBytes,
          Buffer.byteLength(JSON.stringify(entry)),
        );
        maxOutcomesPerInvocation = Math.max(
          maxOutcomesPerInvocation,
          Object.values(entry.outcomes).reduce((sum, count) => sum + count, 0),
        );
        if (attempts > 0) processingInvocationsObserved++;
        if (entry.queue)
          maxQueueLagMs = Math.max(maxQueueLagMs, entry.queue.lagMs);
        for (const name of MetricCounterSchema.options) {
          const value = entry.counts[name];
          if (value !== undefined) counts[name] = (counts[name] ?? 0) + value;
        }
        for (const outcome of OutcomeSchema.options) {
          const count = entry.outcomes[outcome];
          if (count !== undefined)
            outcomesObserved[outcome] =
              (outcomesObserved[outcome] ?? 0) + count;
        }
        for (const reason of AssociationReasonSchema.options) {
          const count = entry.reasons[reason];
          if (count !== undefined)
            reasonsObserved[reason] = (reasonsObserved[reason] ?? 0) + count;
        }
        for (const phase of RunPhaseSchema.options) {
          const byOperation = entry.operations[phase];
          if (!byOperation) continue;
          for (const name of MetricOperationSchema.options) {
            const incoming = byOperation[name];
            if (!incoming) continue;
            operations[phase] ??= {};
            operations[phase][name] ??= {
              calls: 0,
              errors: 0,
              maxMs: 0,
              meanMs: 0,
              totalMs: 0,
            };
            const target = operations[phase][name];
            target.calls += incoming.calls;
            target.errors += incoming.errors;
            target.totalMs += incoming.totalMs;
            target.maxMs = Math.max(target.maxMs, incoming.maxMs);
            target.meanMs = target.calls ? target.totalMs / target.calls : 0;
          }
        }
      }

      const checked = summary.selected - summary.unfinished;
      const processingMs = summary.observedPhaseDurationsMs.processing ?? 0;

      return {
        ...summary,
        activeInvocationMs,
        countsObserved: counts,
        deliveriesObserved: deliveries,
        maxAssetAttemptsPerInvocation,
        maxInvocationLogBytes,
        maxOutcomesPerInvocation,
        maxQueueLagMs,
        operations,
        outcomesObserved,
        processingAssetsPerSecond: processingMs
          ? (checked * 1000) / processingMs
          : null,
        processingInvocationsObserved,
        processingMsPerSelectedAsset: checked ? processingMs / checked : null,
        reasonsObserved,
      };
    });

  return {
    client,
    coverage: {
      expectedRuns,
      invocationCoverage: "best_effort",
      malformedLines,
      observedRuns: runs.length,
    },
    limitations: [
      "Phase durations are wall time, including queue waits and retries. Native polling is not server CPU time.",
      "Operation totals can overlap under concurrency. retry.query includes kvs.query and must not be added to it.",
      "Retention is part of starting/finalizing phase time, not an additional phase.",
      "Invocation logs are best effort. Timeouts, log ingestion delay and CLI limits can omit observations.",
      "This small, mostly-unmatched sample does not establish a 7k/50k completion time. Model candidate volume, match/write rates, retry backlog and measured API/KVS costs separately.",
    ],
    runs,
  };
}

export function parseSmokeClientReport(value: unknown): SmokeClientReport {
  const result = SmokeClientReportSchema.safeParse(value);
  if (!result.success) throw new Error("Invalid smoke client report metadata");
  return result.data;
}

export function requireSmokeMetrics(
  report: ReturnType<typeof buildSmokePerformanceReport>,
): void {
  if (
    report.client.status !== "passed" ||
    report.coverage.observedRuns !== report.coverage.expectedRuns ||
    report.coverage.malformedLines ||
    report.runs.some(
      (run) =>
        !run.deliveriesObserved ||
        run.status === "failed" ||
        !run.selectionComplete ||
        run.unfinished ||
        (run.reasons.unmatched ?? 0) !== run.counts.unresolved ||
        Object.entries(run.reasons).some(
          ([reason, count]) => reason !== "unmatched" && count > 0,
        ),
    )
  ) {
    throw new Error(
      "Smoke metrics are incomplete or failed. Inspect coverage and collect logs again after ingestion",
    );
  }
  if (
    report.client.requireContinuation &&
    report.runs.some((run) => {
      const cap = run.tuning.referenceItems;
      return (
        run.inputChunks !== report.client.inputChunks ||
        run.inputRecords !== report.client.inputRecords ||
        run.inputRecords <= cap ||
        run.selected <= cap ||
        run.processingInvocationsObserved < 2 ||
        run.maxAssetAttemptsPerInvocation > cap ||
        run.maxOutcomesPerInvocation > cap ||
        OutcomeSchema.options.some(
          (outcome) =>
            (run.outcomesObserved[outcome] ?? 0) !== run.counts[outcome],
        ) ||
        AssociationReasonSchema.options.some(
          (reason) =>
            (run.reasonsObserved[reason] ?? 0) !== (run.reasons[reason] ?? 0),
        )
      );
    })
  )
    throw new Error(
      "Smoke continuation evidence is incomplete or exceeds the stored item cap. Inspect input counts, invocation outcomes and effective tuning",
    );
}
