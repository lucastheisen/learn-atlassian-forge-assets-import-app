import z from "zod";

export const ImportTuningSchema = z
  .object({
    // createWorkerBudget reserves this time from the actual timeout in manifest.yml.
    finalizationBudgetMs: z.number().int().positive().default(60_000),
    ingestionChunks: z.number().int().min(1).max(1000).default(200),
    referenceConcurrency: z.number().int().min(1).max(16).default(4),
    referenceItems: z.number().int().min(1).max(1000).default(200),
    runTimeoutMs: z
      .number()
      .int()
      .min(60_000)
      .max(12 * 60 * 60_000)
      .default(2 * 60 * 60_000),
  })
  .strict();

export const ConfigSchema = z
  .object({
    mapping: z.string().default(""),
    tuning: ImportTuningSchema.default({}),
  })
  .strict();

export type Config = z.infer<typeof ConfigSchema>;

export type ImportTuning = z.infer<typeof ImportTuningSchema>;

export const defaultConfig = ConfigSchema.parse({});

export function readConfig(): Config {
  return ConfigSchema.parse(defaultConfig);
}
