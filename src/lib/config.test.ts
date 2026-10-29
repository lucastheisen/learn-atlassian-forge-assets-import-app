import { describe, expect, it } from "vitest";
import { ConfigSchema, defaultConfig, readConfig } from "./config";

describe("ConfigSchema", () => {
  it("applies tuning defaults when configuration only specifies a mapping", () => {
    expect(ConfigSchema.parse({ mapping: "[]" })).toEqual({
      ...defaultConfig,
      mapping: "[]",
    });
  });

  it("preserves configured values while defaulting omitted tuning fields", () => {
    expect(
      ConfigSchema.parse({
        mapping: "[]",
        tuning: {
          finalizationBudgetMs: 90_000,
          ingestionChunks: 100,
          referenceConcurrency: 8,
          referenceItems: 1000,
        },
      }),
    ).toEqual({
      mapping: "[]",
      tuning: {
        ...defaultConfig.tuning,
        finalizationBudgetMs: 90_000,
        ingestionChunks: 100,
        referenceConcurrency: 8,
        referenceItems: 1000,
      },
    });
  });

  it.each([
    null,
    [],
    { mapping: null },
    { tuning: null },
    { tuning: { finalizationBudgetMs: 0 } },
    { tuning: { finalizationBudgetMs: -1 } },
    { tuning: { finalizationBudgetMs: 60_000.5 } },
    { tuning: { finalizationBudgetMs: Number.POSITIVE_INFINITY } },
    { tuning: { finalizationBudgetMs: "60000" } },
    { tuning: { ingestionChunks: 0 } },
    { tuning: { ingestionChunks: 1001 } },
    { tuning: { referenceConcurrency: 0 } },
    { tuning: { referenceConcurrency: 17 } },
    { tuning: { referenceItems: 1.5 } },
    { tuning: { referenceItems: 1001 } },
    { tuning: { runTimeoutMs: 0 } },
    { tuning: { runTimeoutMs: 43_200_001 } },
    { tuning: { unexpected: true } },
    { unexpected: true },
  ])("rejects invalid configuration (%j)", (value) => {
    expect(ConfigSchema.safeParse(value).success).toBe(false);
  });

  it("uses a sixty-second finalization budget by default", () => {
    expect(ConfigSchema.parse({}).tuning.finalizationBudgetMs).toBe(60_000);
  });
});

describe("readConfig", () => {
  it("returns independent configuration snapshots", () => {
    const config = readConfig();
    config.mapping = "changed";
    config.tuning.referenceItems = 1000;
    expect(readConfig()).toEqual(defaultConfig);
    expect(readConfig().tuning.referenceItems).toBe(200);
  });
});
