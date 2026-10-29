import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import type {
  InvocationMetricInProgress,
  MetricCounter,
  MetricOperation,
} from "./reference-metric-schemas";
import type {
  AssociationReason,
  Outcome,
  ReferenceRun,
  RunSummary,
} from "./reference-types";

export const METRICS_PREFIX = "IMPORT_METRICS ";

export const SUMMARY_PREFIX = "IMPORT_SUMMARY ";

const current = new AsyncLocalStorage<InvocationMetricInProgress>();

export function countReferenceMetric(name: MetricCounter, count = 1): void {
  const metric = current.getStore();
  if (metric) metric.counts[name] = (metric.counts[name] ?? 0) + count;
}

export function countReferenceOutcome(
  outcome: Outcome,
  reason?: AssociationReason,
): void {
  const metric = current.getStore();
  if (!metric) return;
  metric.outcomes[outcome] = (metric.outcomes[outcome] ?? 0) + 1;
  if (outcome === "unresolved" && reason) {
    metric.reasons[reason] = (metric.reasons[reason] ?? 0) + 1;
  }
}

export function logReferenceSummary(
  run: ReferenceRun,
  summary: RunSummary,
): void {
  console.log(
    SUMMARY_PREFIX +
      JSON.stringify({
        ...summary,
        chunksCheckpointed: run.index,
        inputChunks: run.inputChunks,
        inputRecords: run.inputRecords,
        lifecycleFailures: run.failures,
        observedCompletedAt: new Date().toISOString(),
        observedDurationMs:
          Date.now() - Date.parse(run.startedAt ?? run.requestedAt),
        observedPhaseDurationsMs: run.phaseDurationsMs,
        uploadId: run.uploadId,
      }),
  );
}

export async function measureReferenceOperation<T>(
  name: MetricOperation,
  operation: () => Promise<T>,
): Promise<T> {
  const metric = current.getStore();
  if (!metric?.toPhase) return operation();
  const phase = metric.operations[metric.toPhase] ?? {};
  metric.operations[metric.toPhase] = phase;
  const value = phase[name] ?? { calls: 0, errors: 0, maxMs: 0, totalMs: 0 };
  phase[name] = value;
  const start = performance.now();
  value.calls++;
  try {
    return await operation();
  } catch (error) {
    value.errors++;
    throw error;
  } finally {
    const elapsed = Math.max(0, Math.round(performance.now() - start));
    value.totalMs += elapsed;
    value.maxMs = Math.max(value.maxMs, elapsed);
  }
}

export function observeReferenceRun(run: ReferenceRun): void {
  const metric = current.getStore();
  if (!metric || (metric.runId && metric.runId !== run.id)) return;
  metric.runId = run.id;
  metric.uploadId = run.uploadId;
  metric.executionId = run.executionId;
  metric.fromPhase ??= run.phase;
  metric.toPhase = run.phase;
  metric.tuning = run.tuning;
}

export async function withReferenceMetrics<T>(
  worker: boolean,
  operation: () => Promise<T>,
  delivery?: { delayMs?: number; queuedAt?: number },
): Promise<T> {
  const start = Date.now();
  const waitMs =
    delivery?.queuedAt === undefined
      ? undefined
      : Math.max(0, start - delivery.queuedAt);
  const metric: InvocationMetricInProgress = {
    counts: {},
    durationMs: 0,
    finishedAt: "",
    invocationId: randomUUID(),
    operations: {},
    outcomes: {},
    queue:
      waitMs === undefined
        ? undefined
        : {
            delayMs: delivery?.delayMs ?? 0,
            lagMs: Math.max(0, waitMs - (delivery?.delayMs ?? 0)),
            waitMs,
          },
    reasons: {},
    startedAt: new Date(start).toISOString(),
    worker,
  };
  return current.run(metric, async () => {
    try {
      return await operation();
    } finally {
      metric.durationMs = Date.now() - start;
      metric.finishedAt = new Date().toISOString();
      if (metric.runId) console.log(METRICS_PREFIX + JSON.stringify(metric));
    }
  });
}
