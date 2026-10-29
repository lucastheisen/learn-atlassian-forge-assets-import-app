import z from "zod";
import { ImportTuningSchema } from "./config.js";
import {
  AssociationReasonSchema,
  CountSchema,
  DurationSchema,
  IdentifierSchema,
  OutcomeSchema,
  RunPhaseSchema,
  RunSummarySchema,
  TimestampSchema,
} from "./reference-schemas.js";

export const MetricCounterSchema = z.enum([
  "aqlCandidates",
  "aqlPages",
  "assetAttempts",
  "chunksSubmitted",
  "continuations",
  "deferredMs",
  "emptyRetryPages",
  "http429",
  "http4xx",
  "http5xx",
  "networkErrors",
  "retryEntries",
  "retryPages",
  "reusedResults",
]);

export const MetricOperationSchema = z.enum([
  "assets.execution",
  "assets.object.read",
  "assets.object.write",
  "assets.schema",
  "assets.search",
  "jira.email",
  "jira.search",
  "kvs.batchDelete",
  "kvs.batchGet",
  "kvs.batchSet",
  "kvs.get",
  "kvs.query",
  "kvs.set",
  "retry.query",
]);

export const OperationMetricSchema = z.object({
  calls: CountSchema,
  errors: CountSchema,
  maxMs: DurationSchema,
  totalMs: DurationSchema,
});

export const InvocationMetricSchema = z.object({
  counts: z.record(MetricCounterSchema, CountSchema),
  durationMs: DurationSchema,
  executionId: IdentifierSchema.optional(),
  finishedAt: TimestampSchema,
  fromPhase: RunPhaseSchema,
  invocationId: IdentifierSchema,
  operations: z.record(
    RunPhaseSchema,
    z.record(MetricOperationSchema, OperationMetricSchema),
  ),
  outcomes: z.record(OutcomeSchema, CountSchema),
  queue: z
    .object({
      delayMs: DurationSchema,
      lagMs: DurationSchema,
      waitMs: DurationSchema,
    })
    .optional(),
  reasons: z.record(AssociationReasonSchema, CountSchema),
  runId: IdentifierSchema,
  startedAt: TimestampSchema,
  toPhase: RunPhaseSchema,
  tuning: ImportTuningSchema,
  uploadId: IdentifierSchema,
  worker: z.boolean(),
});

export const InvocationMetricInProgressSchema = InvocationMetricSchema.partial({
  fromPhase: true,
  runId: true,
  toPhase: true,
  tuning: true,
  uploadId: true,
});

export const RunSummaryLogSchema = RunSummarySchema.required({
  executionId: true,
  queueWaitMs: true,
})
  .extend({
    chunksCheckpointed: CountSchema,
    inputChunks: CountSchema,
    inputRecords: CountSchema,
    lifecycleFailures: CountSchema,
    observedCompletedAt: TimestampSchema,
    observedDurationMs: DurationSchema,
    observedPhaseDurationsMs: z.record(RunPhaseSchema, DurationSchema),
    uploadId: IdentifierSchema,
  })
  .refine(
    (value) => {
      const completed = Object.values(value.counts).reduce(
        (sum, count) => sum + count,
        0,
      );

      return completed + value.unfinished === value.selected;
    },
    {
      message: "Outcome totals do not match selection",
      path: ["counts"],
    },
  );

export type InvocationMetric = z.infer<typeof InvocationMetricSchema>;

export type InvocationMetricInProgress = z.infer<
  typeof InvocationMetricInProgressSchema
>;

export type MetricCounter = z.infer<typeof MetricCounterSchema>;

export type MetricOperation = z.infer<typeof MetricOperationSchema>;

export type OperationMetric = z.infer<typeof OperationMetricSchema>;

export type RunSummaryLog = z.infer<typeof RunSummaryLogSchema>;
