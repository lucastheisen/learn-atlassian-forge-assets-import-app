import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContinueLater } from "./reference-types";
import { createWorkerBudget } from "./worker-budget";

const { remainingTime } = vi.hoisted(() => ({ remainingTime: vi.fn() }));

vi.mock("@forge/api", async (original) => ({
  ...(await original<typeof import("@forge/api")>()),
  getAppContext: () => ({ invocationRemainingTimeInMillis: remainingTime }),
}));

beforeEach(() => {
  remainingTime.mockReset().mockReturnValue(300_000);
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-29T18:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("createWorkerBudget", () => {
  it("accounts for time already spent loading the run", () => {
    const startedAt = Date.now();
    vi.advanceTimersByTime(20_000);
    remainingTime.mockReturnValue(280_000);
    expect(createWorkerBudget(60_000).deadline).toBe(startedAt + 240_000);
  });

  it.each([
    { budgetMs: 240_000, remainingMs: 300_000 },
    { budgetMs: 120_000, remainingMs: 180_000 },
    { budgetMs: 30_000, remainingMs: 90_000 },
  ])("caps work at remaining runtime minus 60 seconds ($remainingMs)", ({
    budgetMs,
    remainingMs,
  }) => {
    remainingTime.mockReturnValue(remainingMs);
    expect(createWorkerBudget(60_000).deadline - Date.now()).toBe(budgetMs);
  });

  it("honors a different configured finalization budget", () => {
    expect(createWorkerBudget(90_000).deadline - Date.now()).toBe(210_000);
  });

  it.each([
    60_000, 55_000, 0,
  ])("yields immediately when only the finalization reserve remains (%i)", (remainingMs) => {
    remainingTime.mockReturnValue(remainingMs);
    const budget = createWorkerBudget(60_000);
    expect(budget.deadline).toBe(Date.now());
    expect(() => budget.check()).toThrow(ContinueLater);
  });
});
