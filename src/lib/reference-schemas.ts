import z from "zod";
import { ImportTuningSchema } from "./config.js";

export const CountSchema = z.number().int().nonnegative();

export const DurationSchema = z.number().finite().nonnegative();

export const IdentifierSchema = z.string().min(1).max(200);

export const TimestampSchema = z.string().datetime({ offset: true });

export const AssociationReasonSchema = z.enum([
  "ambiguous",
  "asset_fetch_failed",
  "asset_type_changed",
  "email_unavailable",
  "inactive_account",
  "invalid_identity",
  "lookup_failed",
  "missing_identity",
  "unknown_activity",
  "unmatched",
  "update_failed",
]);

export const NativeStatusSchema = z.enum([
  "CANCELLED",
  "DONE",
  "INGESTING",
  "PROCESSING",
]);

export const RunFailureSchema = z.enum([
  "cancelled",
  "discovery_failed",
  "native_failed",
  "native_timeout",
  "processing_failed",
  "schema_invalid",
  "source_deleted",
]);

export const RunPhaseSchema = z.enum([
  "queued",
  "starting",
  "ingesting",
  "polling",
  "discovery",
  "processing",
  "aggregation",
  "finalizing",
  "complete",
]);

export const RunStatusSchema = z.enum(["failed", "success", "with_errors"]);

export const SmokePendingPhaseSchema = z.enum([
  ...RunPhaseSchema.exclude(["complete"]).options,
  "objects",
]);

export const ExecutionStatusSchema = z.object({
  progressResult: z
    .object({
      errorMessages: z.unknown(),
      objectTypeResultMap: z
        .record(z.object({ errorMessages: z.unknown() }))
        .optional(),
      result: z.string().optional(),
      status: z.string().optional(),
    })
    .optional(),
  status: NativeStatusSchema,
});

export const OutcomeCountsSchema = z.object({
  deleted: CountSchema,
  inactive: CountSchema,
  unchanged: CountSchema,
  unresolved: CountSchema,
  updated: CountSchema,
});

export const ReferenceScopeSchema = z.object({
  importSourceId: IdentifierSchema,
  testing: z.boolean(),
  workspaceId: IdentifierSchema,
});

export const OutcomeSchema = OutcomeCountsSchema.keyof();

export const RunSummarySchema = ReferenceScopeSchema.extend({
  completedAt: TimestampSchema,
  counts: OutcomeCountsSchema,
  detailsPrefix: z.string().min(1),
  durationMs: DurationSchema,
  executionId: IdentifierSchema.optional(),
  failure: RunFailureSchema.optional(),
  phaseDurationsMs: z.record(RunPhaseSchema, DurationSchema),
  queueWaitMs: DurationSchema.optional(),
  reasons: z.record(AssociationReasonSchema, CountSchema),
  retentionDurationMs: DurationSchema,
  runId: IdentifierSchema,
  selected: CountSchema,
  selectionComplete: z.boolean(),
  startedAt: TimestampSchema,
  status: RunStatusSchema,
  tuning: ImportTuningSchema,
  unfinished: CountSchema,
});

export type AssociationReason = z.infer<typeof AssociationReasonSchema>;

export type ExecutionStatus = z.infer<typeof ExecutionStatusSchema>;

export type Outcome = z.infer<typeof OutcomeSchema>;

export type OutcomeCounts = z.infer<typeof OutcomeCountsSchema>;

export type ReferenceScope = z.infer<typeof ReferenceScopeSchema>;

export type RunFailure = z.infer<typeof RunFailureSchema>;

export type RunPhase = z.infer<typeof RunPhaseSchema>;

export type RunSummary = z.infer<typeof RunSummarySchema>;

export type SmokePendingPhase = z.infer<typeof SmokePendingPhaseSchema>;
