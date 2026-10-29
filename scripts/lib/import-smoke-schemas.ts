import z from "zod";
import {
  CountSchema,
  DurationSchema,
  IdentifierSchema,
  SmokePendingPhaseSchema,
  TimestampSchema,
} from "../../src/lib/reference-schemas.js";

const CheckStatus = z.enum(["failed", "passed"]);

export const SmokeImportOptionsSchema = z.object({
  pollTimeoutMs: z.number().int().min(30_000).max(1_800_000).default(300_000),
  requireContinuation: z.boolean().default(false),
  userCount: z.number().int().min(1).max(1000).default(15),
});

export const SmokeLogEnvelopeSchema = z.object({ uploadId: IdentifierSchema });

export const SmokeStepSchema = z.object({
  durationMs: DurationSchema,
  name: IdentifierSchema,
  phases: z.array(
    z.object({ elapsedMs: DurationSchema, phase: IdentifierSchema }),
  ),
  requests: CountSchema,
  status: CheckStatus,
});

export const SmokeClientReportSchema = z.object({
  durationMs: DurationSchema,
  finishedAt: TimestampSchema,
  inputChunks: CountSchema,
  inputRecords: CountSchema,
  requireContinuation: z.boolean(),
  startedAt: TimestampSchema,
  status: CheckStatus,
  steps: z.array(SmokeStepSchema),
  uploadId: z.string().regex(/^smoke-import-\d+$/),
});

export const WebTriggerResponseSchema = z
  .object({
    phase: SmokePendingPhaseSchema.optional(),
    status: z.number().int().min(100).max(599),
    title: IdentifierSchema,
  })
  .refine((value) => value.status !== 202 || value.phase !== undefined, {
    message: "Pending responses require a phase",
    path: ["phase"],
  });

export type SmokeClientReport = z.infer<typeof SmokeClientReportSchema>;

export type SmokeImportOptions = z.input<typeof SmokeImportOptionsSchema>;

export type SmokeStep = z.infer<typeof SmokeStepSchema>;

export type WebTriggerResponse = z.infer<typeof WebTriggerResponseSchema>;
